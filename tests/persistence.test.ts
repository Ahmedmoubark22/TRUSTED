import { describe, expect, it } from 'vitest';
import { createDevGame } from '../src/app/dev/devSeed';
import { createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import {
  ACTIVE_SESSION_KEY,
  LEGACY_GAME_STATE_KEY,
  sessionStorageKey,
} from '../src/engine/session';
import type { GameState } from '../src/engine/types';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_002 } from '../src/content/cases/case-002';
import { atVoting, briefAllPlayers, ctx, run, seatedGame } from './helpers';

/** A game parked at `phase`, belonging to an explicitly named session. */
function sessionAt(phase: GameState['phase'], sessionId: string): GameState {
  return { ...createDevGame(phase), sessionId };
}

describe('1 · a session is created per game, not per browser', () => {
  it('mints a session id when a case is opened, and not before', () => {
    const home = createInitialState();
    expect(home.sessionId).toBeNull();

    const opened = reduce(home, { type: 'SELECT_CASE', caseId: CASE_001.id }, ctx);
    expect(opened.sessionId).toEqual(expect.any(String));
    expect(opened.sessionId).not.toBe('');
  });

  it('gives a second game a different session id', () => {
    const first = reduce(createInitialState(), { type: 'SELECT_CASE', caseId: CASE_001.id }, ctx);
    // Leaving the case ends the session, exactly as "Back" does in the UI.
    const home = reduce(first, { type: 'BACK_TO_HOME' }, ctx);
    expect(home.sessionId).toBeNull();

    const second = reduce(home, { type: 'SELECT_CASE', caseId: CASE_001.id }, ctx);
    expect(second.sessionId).not.toBe(first.sessionId);
  });

  it('carries no gameplay from the previous session into the next', () => {
    const played = briefAllPlayers(seatedGame());
    expect(played.players.length).toBeGreaterThan(0);
    expect(Object.keys(played.assignments)).not.toHaveLength(0);

    const home = reduce(played, { type: 'RESET' }, ctx);
    const fresh = reduce(home, { type: 'SELECT_CASE', caseId: CASE_001.id }, ctx);

    expect(fresh.sessionId).not.toBe(played.sessionId);
    expect(fresh.assignments).toEqual({});
    expect(fresh.votes).toEqual({});
    expect(fresh.revealedEvidence).toEqual([]);
    expect(fresh.phase).toBe('CASE_INTRO');
  });
});

describe('2 · session state persists under its own key', () => {
  it('writes the game under trusted:session:<id> and points the device at it', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const state = sessionAt('DISCUSSION', 'session-A');

    persistence.save(state);

    expect(store.get(ACTIVE_SESSION_KEY)).toBe('session-A');
    expect(store.get(sessionStorageKey('session-A'))).not.toBeNull();
    // Never a shared, browser-wide game key.
    expect(store.get(LEGACY_GAME_STATE_KEY)).toBeNull();
    expect(persistence.activeSessionId()).toBe('session-A');
    expect(persistence.load()).toEqual(state);
  });

  it('returns nothing when the browser has no session', () => {
    expect(createGamePersistence(createMemoryStore()).load()).toBeNull();
  });

  it('drops a record whose id disagrees with the key it was filed under', () => {
    const store = createMemoryStore();
    store.set(ACTIVE_SESSION_KEY, 'session-A');
    store.set(sessionStorageKey('session-A'), JSON.stringify(sessionAt('TABLE', 'session-B')));

    expect(createGamePersistence(store).load()).toBeNull();
  });

  it('discards unparseable and invalid payloads instead of crashing', () => {
    const bad = createMemoryStore();
    bad.set(ACTIVE_SESSION_KEY, 'session-A');
    bad.set(sessionStorageKey('session-A'), '{ not json');
    expect(createGamePersistence(bad).load()).toBeNull();

    const invalid = createMemoryStore();
    invalid.set(ACTIVE_SESSION_KEY, 'session-A');
    invalid.set(sessionStorageKey('session-A'), JSON.stringify({ phase: 'ELSEWHERE' }));
    expect(createGamePersistence(invalid).load()).toBeNull();
  });

  it('never blows up when storage refuses to write', () => {
    const persistence = createGamePersistence({
      get: () => null,
      set: () => {
        throw new Error('QuotaExceededError');
      },
      remove: () => {},
    });
    expect(() => persistence.save(sessionAt('TABLE', 'session-A'))).not.toThrow();
  });

  it('clears the session and the pointer together', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(sessionAt('TABLE', 'session-A'));

    persistence.clear();

    expect(persistence.load()).toBeNull();
    expect(store.get(ACTIVE_SESSION_KEY)).toBeNull();
    expect(store.get(sessionStorageKey('session-A'))).toBeNull();
  });

  it('sweeps away the pre-session shared key without ever restoring it', () => {
    const store = createMemoryStore();
    store.set(LEGACY_GAME_STATE_KEY, JSON.stringify(createDevGame('VOTING')));

    expect(createGamePersistence(store).load()).toBeNull();
    expect(store.get(LEGACY_GAME_STATE_KEY)).toBeNull();
  });
});

describe('3–5 · ordinary gameplay resumes on its own', () => {
  it('resumes the table, evidence and discussion without asking', () => {
    for (const phase of ['TABLE', 'EVIDENCE', 'DISCUSSION'] as const) {
      const store = createMemoryStore();
      const persistence = createGamePersistence(store);
      const state = sessionAt(phase, `session-${phase}`);
      persistence.save(state);

      const restored = persistence.load()!;
      expect(restored.phase).toBe(phase);
      expect(restored.recoveryRequired).toBe(false);
    }
  });

  it('keeps evidence progression across a refresh', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const state = sessionAt('DISCUSSION', 'session-A');
    expect(state.revealedEvidence.length).toBeGreaterThan(0);

    persistence.save(state);
    const restored = persistence.load()!;

    expect(restored.revealedEvidence).toEqual(state.revealedEvidence);
    expect(restored.caseId).toBe(state.caseId);
    expect(restored.players).toEqual(state.players);
    expect(restored.assignments).toEqual(state.assignments);
  });
});

describe('6 · a briefing recovers sealed, never open', () => {
  it('restores to the gate and exposes no briefing content', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    // Somebody was mid-briefing, reading their secret, when the tab was closed.
    const exposed = run(seatedGame(), { type: 'UNLOCK_BRIEFING' }, { type: 'ADVANCE_BRIEFING_STEP' });
    persistence.save(exposed);

    const restored = persistence.load()!;
    expect(restored.phase).toBe('PRIVATE_BRIEFINGS');
    expect(restored.briefingStep).toBe('LOCKED');
    expect(restored.briefingResumed).toBe(true);
    // The seat is unchanged — only the gate was shut.
    expect(restored.briefingCursor).toBe(exposed.briefingCursor);
    // A briefing is safe to walk back into, because it lands on the gate.
    expect(restored.recoveryRequired).toBe(false);
  });
});

describe('7–8 · an interrupted vote is handed back deliberately', () => {
  it('does not resume as an active vote', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    const open = run(atVoting(), { type: 'UNLOCK_VOTE' });
    persistence.save(open);

    const restored = persistence.load()!;
    // The phase is remembered, but the app must not act on it yet.
    expect(restored.phase).toBe('VOTING');
    expect(restored.recoveryRequired).toBe(true);
    expect(restored.voteStep).toBe('LOCKED');
  });

  it('asks even when the ballot gate was already closed', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    // Mid-handoff: nobody had opened the gate, but the round is part-done.
    persistence.save(atVoting());

    expect(persistence.load()!.recoveryRequired).toBe(true);
  });

  it('refuses every event that would advance the game until it is answered', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(run(atVoting(), { type: 'UNLOCK_VOTE' }));
    const gated = persistence.load()!;

    for (const event of [
      { type: 'UNLOCK_VOTE' },
      { type: 'CAST_VOTE', voterId: gated.players[0]!.id, targetCharacterId: 'omar' },
      { type: 'ADVANCE_VOTE_REVEAL' },
      { type: 'SHOW_TRUTH' },
      { type: 'START_VOTING' },
      { type: 'BACK_TO_HOME' },
    ] as const) {
      expect(reduce(gated, event, ctx)).toBe(gated);
    }
  });

  it('neither submits nor discards the votes already locked in', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    const base = atVoting();
    const voter = base.players[0]!;
    const midway = run(
      base,
      { type: 'UNLOCK_VOTE' },
      { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: 'omar' },
      { type: 'UNLOCK_VOTE' },
    );
    expect(Object.keys(midway.votes)).toHaveLength(1);
    persistence.save(midway);

    const restored = persistence.load()!;
    // Exactly what was locked in — nothing added, nothing thrown away.
    expect(restored.votes).toEqual(midway.votes);
    expect(restored.voteCursor).toBe(midway.voteCursor);

    const resumed = reduce(restored, { type: 'RESUME_SESSION' }, ctx);
    expect(resumed.recoveryRequired).toBe(false);
    expect(resumed.votes).toEqual(midway.votes);
    expect(resumed.voteCursor).toBe(midway.voteCursor);
    expect(resumed.phase).toBe('VOTING');
    expect(resumed.voteStep).toBe('LOCKED');
  });

  it('starts the case over on a new session when the table chooses to', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(run(atVoting(), { type: 'UNLOCK_VOTE' }));
    const gated = persistence.load()!;

    const restarted = reduce(gated, { type: 'RESTART_SESSION' }, ctx);

    expect(restarted.sessionId).not.toBe(gated.sessionId);
    expect(restarted.recoveryRequired).toBe(false);
    expect(restarted.phase).toBe('CASE_INTRO');
    expect(restarted.caseId).toBe(gated.caseId);
    // Discarding is the table's explicit choice, and it is total.
    expect(restarted.votes).toEqual({});
    expect(restarted.assignments).toEqual({});
    expect(restarted.revealedEvidence).toEqual([]);
  });

  it('ignores both recovery events when no recovery is pending', () => {
    const playing = sessionAt('DISCUSSION', 'session-A');
    expect(reduce(playing, { type: 'RESUME_SESSION' }, ctx)).toBe(playing);
    expect(reduce(playing, { type: 'RESTART_SESSION' }, ctx)).toBe(playing);
  });
});

describe('11 · a finished case stays finished', () => {
  it('does not restore a completed session as a live game', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(sessionAt('CASE_COMPLETE', 'session-done'));

    expect(persistence.load()).toBeNull();
    // And it is gone, so it cannot come back on the next open either.
    expect(store.get(ACTIVE_SESSION_KEY)).toBeNull();
    expect(store.get(sessionStorageKey('session-done'))).toBeNull();
  });

  it('gives the next game a new session rather than the completed one', () => {
    const completed = sessionAt('CASE_COMPLETE', 'session-done');
    const home = reduce(completed, { type: 'BACK_TO_HOME' }, ctx);
    expect(home.sessionId).toBeNull();

    const next = reduce(home, { type: 'SELECT_CASE', caseId: CASE_002.id }, ctx);
    expect(next.sessionId).not.toBe('session-done');
    expect(next.caseId).toBe(CASE_002.id);
  });

  it('forgets the session once the table leaves the game', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(sessionAt('DISCUSSION', 'session-A'));

    // Leaving for HOME produces a state with no session; the record goes too.
    persistence.save(createInitialState());

    expect(persistence.load()).toBeNull();
    expect(store.get(sessionStorageKey('session-A'))).toBeNull();
  });
});

describe('12 · separate sessions are isolated', () => {
  it('keeps two games in one browser from reading or overwriting each other', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    const groupA = sessionAt('VOTING', 'session-A');
    const groupB = { ...sessionAt('DISCUSSION', 'session-B'), caseId: CASE_002.id };

    persistence.save(groupA);
    persistence.save(groupB);

    // Each is readable by its own id, and neither has taken the other's shape.
    expect(persistence.loadSession('session-A')!.phase).toBe('VOTING');
    expect(persistence.loadSession('session-B')!.phase).toBe('DISCUSSION');
    expect(persistence.loadSession('session-A')!.caseId).toBe(CASE_001.id);
    expect(persistence.loadSession('session-B')!.caseId).toBe(CASE_002.id);
    expect(persistence.loadSession('session-A')!.sessionId).toBe('session-A');
  });

  it('keeps two devices entirely separate', () => {
    // Different browsers are different stores; neither can see the other.
    const deviceA = createGamePersistence(createMemoryStore());
    const deviceB = createGamePersistence(createMemoryStore());

    deviceA.save(sessionAt('VOTING', 'session-A'));
    deviceB.save(sessionAt('TABLE', 'session-B'));

    expect(deviceA.activeSessionId()).toBe('session-A');
    expect(deviceB.activeSessionId()).toBe('session-B');
    expect(deviceA.loadSession('session-B')).toBeNull();
    expect(deviceB.loadSession('session-A')).toBeNull();
    expect(deviceB.load()!.phase).toBe('TABLE');
  });
});
