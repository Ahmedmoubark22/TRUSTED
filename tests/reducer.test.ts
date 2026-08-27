import { describe, expect, it } from 'vitest';
import { CASE_001 } from '../src/content/cases/case-001';
import { getCase } from '../src/content/registry';
import { createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import { accusedPlayers, allVotesCast, voteTally } from '../src/engine/selectors';
import type { EngineContext, GameState } from '../src/engine/types';
import type { GameEvent } from '../src/engine/events';

/** Deterministic context: fixed clock, fixed RNG, real case content. */
const ctx: EngineContext = {
  now: () => 1_000,
  random: () => 0.42,
  getCase,
};

function run(state: GameState, ...events: GameEvent[]): GameState {
  return events.reduce((s, e) => reduce(s, e, ctx), state);
}

function seatedGame(playerCount = 4): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_001.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: playerCount },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

describe('reduce', () => {
  it('starts at HOME with no case', () => {
    const state = createInitialState();
    expect(state.phase).toBe('HOME');
    expect(state.caseId).toBeNull();
  });

  it('ignores an unknown case', () => {
    const state = createInitialState();
    expect(reduce(state, { type: 'SELECT_CASE', caseId: 'nope' }, ctx)).toBe(state);
  });

  it('returns the same state reference for an illegal move', () => {
    const state = createInitialState();
    // Voting cannot start from HOME.
    expect(reduce(state, { type: 'START_VOTING' }, ctx)).toBe(state);
  });

  it('deals one distinct character per player', () => {
    const state = seatedGame(4);
    const dealt = Object.values(state.assignments);
    expect(dealt).toHaveLength(4);
    expect(new Set(dealt).size).toBe(4);
    expect(state.phase).toBe('PRIVATE_BRIEFINGS');
  });

  it('refuses to seat more players than the case supports', () => {
    let state = run(
      createInitialState(),
      { type: 'SELECT_CASE', caseId: CASE_001.id },
      { type: 'INTRO_COMPLETE' },
      { type: 'SET_PLAYER_COUNT', count: 99 },
    );
    expect(state.players.length).toBe(CASE_001.maxPlayers);

    state = run(state, { type: 'SET_PLAYER_COUNT', count: 1 });
    expect(state.players.length).toBe(3);
  });

  it('walks the briefing cursor seat by seat, then opens the table', () => {
    let state = seatedGame(4);
    expect(state.briefingCursor).toBe(0);
    state = run(state, { type: 'ADVANCE_BRIEFING' }, { type: 'ADVANCE_BRIEFING' });
    expect(state.phase).toBe('PRIVATE_BRIEFINGS');
    expect(state.briefingCursor).toBe(2);
    state = run(state, { type: 'ADVANCE_BRIEFING' }, { type: 'ADVANCE_BRIEFING' });
    expect(state.phase).toBe('TABLE');
    expect(state.briefingCursor).toBe(0);
  });

  it('honours evidence prerequisites', () => {
    let state = seatedGame(4);
    state = run(state, ...Array.from({ length: 4 }, () => ({ type: 'ADVANCE_BRIEFING' }) as const));
    state = run(state, { type: 'OPEN_EVIDENCE' });

    // e3 requires e1.
    const blocked = reduce(state, { type: 'REVEAL_EVIDENCE', evidenceId: 'e3' }, ctx);
    expect(blocked.revealedEvidence).toEqual([]);

    state = run(state, { type: 'REVEAL_EVIDENCE', evidenceId: 'e1' }, { type: 'REVEAL_EVIDENCE', evidenceId: 'e3' });
    expect(state.revealedEvidence).toEqual(['e1', 'e3']);

    // Revealing twice does nothing.
    expect(reduce(state, { type: 'REVEAL_EVIDENCE', evidenceId: 'e1' }, ctx)).toBe(state);
  });

  it('collects votes in seat order and only from the player whose turn it is', () => {
    let state = seatedGame(4);
    state = run(
      state,
      ...Array.from({ length: 4 }, () => ({ type: 'ADVANCE_BRIEFING' }) as const),
      { type: 'READY_TO_DECIDE' },
      { type: 'START_VOTING' },
    );
    expect(state.phase).toBe('VOTING');

    const [p1, p2, p3, p4] = state.players;
    if (!p1 || !p2 || !p3 || !p4) throw new Error('expected four players');

    // Out-of-turn votes are rejected.
    expect(reduce(state, { type: 'CAST_VOTE', voterId: p3.id, accusedId: p1.id }, ctx)).toBe(state);

    state = run(
      state,
      { type: 'CAST_VOTE', voterId: p1.id, accusedId: p3.id },
      { type: 'CAST_VOTE', voterId: p2.id, accusedId: p3.id },
      { type: 'CAST_VOTE', voterId: p3.id, accusedId: p1.id },
    );
    expect(state.phase).toBe('VOTING');
    expect(allVotesCast(state)).toBe(false);

    state = run(state, { type: 'CAST_VOTE', voterId: p4.id, accusedId: p3.id });
    expect(state.phase).toBe('VOTE_REVEAL');
    expect(allVotesCast(state)).toBe(true);
    expect(voteTally(state)[0]).toMatchObject({ playerId: p3.id, votes: 3 });
    expect(accusedPlayers(state).map((a) => a.playerId)).toEqual([p3.id]);
  });

  it('steps through every truth beat before closing the case', () => {
    let state: GameState = { ...seatedGame(4), phase: 'VOTE_REVEAL' };
    state = run(state, { type: 'SHOW_TRUTH' });
    expect(state.phase).toBe('TRUTH_REVEAL');

    for (let i = 0; i < CASE_001.truthBeats.length - 1; i += 1) {
      state = run(state, { type: 'ADVANCE_TRUTH_BEAT' });
      expect(state.phase).toBe('TRUTH_REVEAL');
    }
    state = run(state, { type: 'ADVANCE_TRUTH_BEAT' });
    expect(state.phase).toBe('CASE_COMPLETE');
  });

  it('can be played end to end from HOME to CASE_COMPLETE', () => {
    let state = seatedGame(4);
    state = run(state, ...Array.from({ length: 4 }, () => ({ type: 'ADVANCE_BRIEFING' }) as const));
    expect(state.phase).toBe('TABLE');

    state = run(
      state,
      { type: 'OPEN_EVIDENCE' },
      { type: 'REVEAL_EVIDENCE', evidenceId: 'e1' },
      { type: 'CLOSE_EVIDENCE' },
      { type: 'OPEN_DISCUSSION' },
      { type: 'READY_TO_DECIDE' },
      { type: 'START_VOTING' },
    );

    for (const player of state.players) {
      const accused = state.players.find((p) => p.id !== player.id);
      if (!accused) throw new Error('expected another player');
      state = run(state, { type: 'CAST_VOTE', voterId: player.id, accusedId: accused.id });
    }
    expect(state.phase).toBe('VOTE_REVEAL');

    state = run(state, { type: 'SHOW_TRUTH' });
    while (state.phase === 'TRUTH_REVEAL') {
      state = run(state, { type: 'ADVANCE_TRUTH_BEAT' });
    }
    expect(state.phase).toBe('CASE_COMPLETE');

    state = run(state, { type: 'BACK_TO_HOME' });
    expect(state.phase).toBe('HOME');
    expect(state.caseId).toBeNull();
  });
});
