import type { GameState } from '../engine/types';
import { isGameState, migrate } from '../engine/validate';
import { createLocalStore, type KeyValueStore } from './storage';

export const GAME_STATE_KEY = 'trusted.game';

/**
 * Persists the one authoritative state so a mis-tap, a locked screen, or a
 * refresh mid-case does not lose the table's progress.
 */
export interface GamePersistence {
  load: () => GameState | null;
  save: (state: GameState) => void;
  clear: () => void;
}

/**
 * Close anything private that was open when the state was written.
 *
 * A refresh must never drop somebody straight back into live private content
 * — the phone may well be in a different pair of hands by then. Restoring
 * always lands on the gate, and the `*Resumed` flag tells the gate to say so
 * rather than reopening as if nothing happened.
 *
 * Both private moments are covered: reading a briefing, and casting a vote.
 * A restored ballot is sealed but *not* discarded — the votes already locked
 * in are still valid, and the player mid-decision simply chooses again.
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

export function createGamePersistence(store: KeyValueStore = createLocalStore()): GamePersistence {
  return {
    load() {
      const raw = store.get(GAME_STATE_KEY);
      if (!raw) return null;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        store.remove(GAME_STATE_KEY);
        return null;
      }
      // Unknown or corrupt payloads are dropped, never partially trusted.
      if (!isGameState(parsed)) {
        const migrated = migrate(parsed);
        store.remove(GAME_STATE_KEY);
        return migrated.phase === 'HOME' ? null : sealPrivateContent(migrated);
      }
      return sealPrivateContent(parsed);
    },

    save(state) {
      try {
        store.set(GAME_STATE_KEY, JSON.stringify(state));
      } catch {
        /* non-serialisable state should be impossible; never block play */
      }
    },

    clear() {
      store.remove(GAME_STATE_KEY);
    },
  };
}
