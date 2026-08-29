import type { GameState } from '../engine/types';
import {
  ACTIVE_SESSION_KEY,
  LEGACY_GAME_STATE_KEY,
  sessionStorageKey,
  type SessionId,
} from '../engine/session';
import { isGameState } from '../engine/validate';
import { createLocalStore, type KeyValueStore } from './storage';

/**
 * Persists one *session* — one group's play-through of one case — so a
 * mis-tap, a locked screen, or a refresh mid-case does not lose their progress.
 *
 * Two kinds of key, and the split is the point:
 *
 *   device   `trusted:active-session`   which session this browser is in
 *   session  `trusted:session:<id>`     that session's whole game state
 *
 * Nothing is written to a shared key. Two groups on two devices, or two games
 * on one device, occupy different session keys and cannot read or overwrite
 * one another. This is isolation between local sessions — it is not
 * synchronisation, and there is no server involved.
 */
export interface GamePersistence {
  load: () => GameState | null;
  save: (state: GameState) => void;
  clear: () => void;
  /** The session this browser is currently in, if any. Diagnostics and tests. */
  activeSessionId: () => SessionId | null;
  /** Read one session directly, bypassing the active pointer. Tests only. */
  loadSession: (sessionId: SessionId) => GameState | null;
}

/**
 * Close anything private that was open when the state was written.
 *
 * A restore must never drop somebody straight back into live private content
 * — the phone may well be in a different pair of hands by then. Restoring
 * always lands on the gate, and the `*Resumed` flag tells the gate to say so
 * rather than reopening as if nothing happened.
 *
 * A restored ballot is sealed but *not* discarded: the votes already locked in
 * are still valid, and the player who was mid-decision simply chooses again.
 */
function sealPrivateContent(state: GameState): GameState {
  if (state.phase === 'PRIVATE_BRIEFINGS' && state.briefingStep !== 'LOCKED') {
    return { ...state, briefingStep: 'LOCKED', briefingResumed: true };
  }
  if (state.phase === 'VOTING' && state.voteStep !== 'LOCKED') {
    return { ...state, voteStep: 'LOCKED', voteResumed: true };
  }
  return state;
}

/**
 * Whether coming back to this state has to be a decision rather than a resume.
 *
 * Evidence, discussion and the table are safe to walk back into: the screen
 * is shared, and nothing is half-committed. A briefing is safe too, because
 * sealing it lands the next person on the gate.
 *
 * A vote is neither. The round is part-finished, the device was mid-handoff,
 * and whoever picks the phone up next is not necessarily whoever put it down —
 * so the table is asked before the game is handed back. Sealing the ballot
 * alone is not enough: that closes the gate but still opens *inside* the vote.
 */
function needsDeliberateRecovery(state: GameState): boolean {
  return state.phase === 'VOTING';
}

/** A finished case is not a game to be resumed. */
function isComplete(state: GameState): boolean {
  return state.phase === 'CASE_COMPLETE';
}

export function createGamePersistence(store: KeyValueStore = createLocalStore()): GamePersistence {
  function readSession(sessionId: SessionId): GameState | null {
    const raw = store.get(sessionStorageKey(sessionId));
    if (!raw) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      store.remove(sessionStorageKey(sessionId));
      return null;
    }
    // Unknown, corrupt or older-schema payloads are dropped, never partially
    // trusted. A schema bump therefore starts the browser at HOME rather than
    // reviving a game the current engine no longer understands.
    if (!isGameState(parsed)) {
      store.remove(sessionStorageKey(sessionId));
      return null;
    }
    return parsed;
  }

  function forget(sessionId: SessionId): void {
    store.remove(sessionStorageKey(sessionId));
    store.remove(ACTIVE_SESSION_KEY);
  }

  return {
    activeSessionId() {
      return store.get(ACTIVE_SESSION_KEY);
    },

    loadSession(sessionId) {
      return readSession(sessionId);
    },

    load() {
      // The pre-session build wrote every game to one shared key. Clear it out
      // once; its contents belong to no session and are never restored.
      store.remove(LEGACY_GAME_STATE_KEY);

      const sessionId = store.get(ACTIVE_SESSION_KEY);
      if (!sessionId) return null;

      const state = readSession(sessionId);
      if (!state) {
        store.remove(ACTIVE_SESSION_KEY);
        return null;
      }

      // A record whose id disagrees with its own key is not trustworthy.
      if (state.sessionId !== sessionId) {
        forget(sessionId);
        return null;
      }

      // A closed case stays closed. The next game gets a new session rather
      // than inheriting a finished one.
      if (isComplete(state)) {
        forget(sessionId);
        return null;
      }

      const sealed = sealPrivateContent(state);
      return needsDeliberateRecovery(sealed) ? { ...sealed, recoveryRequired: true } : sealed;
    },

    save(state) {
      // No session means no game running — HOME, or a table that has left one.
      // Drop the pointer and the record it named so the next game cannot
      // inherit anything from the last.
      if (!state.sessionId) {
        const previous = store.get(ACTIVE_SESSION_KEY);
        if (previous) forget(previous);
        return;
      }
      try {
        store.set(sessionStorageKey(state.sessionId), JSON.stringify(state));
        store.set(ACTIVE_SESSION_KEY, state.sessionId);
      } catch {
        /* non-serialisable state should be impossible; never block play */
      }
    },

    clear() {
      const sessionId = store.get(ACTIVE_SESSION_KEY);
      if (sessionId) store.remove(sessionStorageKey(sessionId));
      store.remove(ACTIVE_SESSION_KEY);
      store.remove(LEGACY_GAME_STATE_KEY);
    },
  };
}
