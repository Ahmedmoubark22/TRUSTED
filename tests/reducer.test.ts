import { describe, expect, it } from 'vitest';
import { CASE_001 } from '../src/content/cases/case-001';
import { MAX_PLAYERS, MIN_PLAYERS, createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import { accusedPlayers, allVotesCast, voteTally } from '../src/engine/selectors';
import type { GameState } from '../src/engine/types';
import { briefAllPlayers, briefOnePlayer, ctx, run, seatedGame } from './helpers';

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

  it('seats the case default and deals one distinct character per player', () => {
    const state = seatedGame();
    expect(state.players).toHaveLength(4);
    const dealt = Object.values(state.assignments);
    expect(dealt).toHaveLength(4);
    expect(new Set(dealt).size).toBe(4);
    expect(state.phase).toBe('PRIVATE_BRIEFINGS');
    expect(state.briefingStep).toBe('LOCKED');
  });

  it('refuses to start a case with a player count it was not written for', () => {
    let state = run(
      createInitialState(),
      { type: 'SELECT_CASE', caseId: CASE_001.id },
      { type: 'INTRO_COMPLETE' },
    );
    expect(state.players).toHaveLength(CASE_001.minPlayers);

    // The engine clamps to the product-wide range...
    state = run(state, { type: 'SET_PLAYER_COUNT', count: 99 });
    expect(state.players).toHaveLength(MAX_PLAYERS);
    // ...but the case decides what it can actually be played with.
    expect(reduce(state, { type: 'CONFIRM_PLAYERS' }, ctx)).toBe(state);

    state = run(state, { type: 'SET_PLAYER_COUNT', count: 1 });
    expect(state.players).toHaveLength(MIN_PLAYERS);
    expect(reduce(state, { type: 'CONFIRM_PLAYERS' }, ctx)).toBe(state);

    state = run(state, { type: 'SET_PLAYER_COUNT', count: 4 }, { type: 'CONFIRM_PLAYERS' });
    expect(state.phase).toBe('CHARACTER_ASSIGNMENT');
  });

  it('walks the briefing seat by seat, then opens the table', () => {
    let state = seatedGame();
    expect(state.briefingCursor).toBe(0);

    state = briefOnePlayer(state);
    expect(state.phase).toBe('PRIVATE_BRIEFINGS');
    expect(state.briefingCursor).toBe(1);

    state = briefOnePlayer(state);
    expect(state.briefingCursor).toBe(2);

    state = briefOnePlayer(briefOnePlayer(state));
    expect(state.phase).toBe('TABLE');
    expect(state.briefingCursor).toBe(0);
  });

  it('honours evidence prerequisites', () => {
    let state = briefAllPlayers(seatedGame());
    state = run(state, { type: 'OPEN_EVIDENCE' });

    // e3 requires e1.
    const blocked = reduce(state, { type: 'REVEAL_EVIDENCE', evidenceId: 'e3' }, ctx);
    expect(blocked.revealedEvidence).toEqual([]);

    state = run(
      state,
      { type: 'REVEAL_EVIDENCE', evidenceId: 'e1' },
      { type: 'REVEAL_EVIDENCE', evidenceId: 'e3' },
    );
    expect(state.revealedEvidence).toEqual(['e1', 'e3']);

    // Revealing twice does nothing.
    expect(reduce(state, { type: 'REVEAL_EVIDENCE', evidenceId: 'e1' }, ctx)).toBe(state);
  });

  it('collects votes in seat order and only from the player whose turn it is', () => {
    let state = briefAllPlayers(seatedGame());
    state = run(state, { type: 'READY_TO_DECIDE' }, { type: 'START_VOTING' });
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
    let state: GameState = { ...seatedGame(), phase: 'VOTE_REVEAL' };
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
    let state = briefAllPlayers(seatedGame());
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
