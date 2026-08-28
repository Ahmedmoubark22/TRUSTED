import { describe, expect, it } from 'vitest';
import { CASE_001 } from '../src/content/cases/case-001';
import { MAX_PLAYERS, MIN_PLAYERS, createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import { allVotesCast, voteCounts, voteOutcome } from '../src/engine/selectors';
import type { GameState } from '../src/engine/types';
import {
  briefAllPlayers,
  briefOnePlayer,
  castVote,
  characterOf,
  ctx,
  placeNextEvidence,
  playAllEvidence,
  readOutVotes,
  run,
  seatedGame,
  voteAll,
} from './helpers';

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

    // e02 requires e01, so nothing about it can be touched yet.
    expect(reduce(state, { type: 'INSPECT_EVIDENCE', evidenceId: 'e02' }, ctx)).toBe(state);
    expect(reduce(state, { type: 'PLACE_EVIDENCE', evidenceId: 'e02' }, ctx)).toBe(state);
    expect(state.revealedEvidence).toEqual([]);

    state = run(placeNextEvidence(state), { type: 'DISCUSSION_COMPLETE' });
    expect(state.revealedEvidence).toEqual(['e01']);

    // With e01 down, e02 is the object in front of the table.
    state = placeNextEvidence(state);
    expect(state.revealedEvidence).toEqual(['e01', 'e02']);

    // And e01 cannot be placed a second time.
    expect(reduce(state, { type: 'PLACE_EVIDENCE', evidenceId: 'e01' }, ctx)).toBe(state);
  });

  it('collects votes in seat order and only from the player whose turn it is', () => {
    let state = run(briefAllPlayers(seatedGame()), { type: 'READY_TO_DECIDE' }, { type: 'START_VOTING' });
    expect(state.phase).toBe('VOTING');

    const [p1, p2, p3, p4] = state.players;
    if (!p1 || !p2 || !p3 || !p4) throw new Error('expected four players');
    const target = characterOf(state, 2);

    // Out-of-turn votes are rejected, gate open or not.
    const opened = run(state, { type: 'UNLOCK_VOTE' });
    expect(
      reduce(opened, { type: 'CAST_VOTE', voterId: p3.id, targetCharacterId: target }, ctx),
    ).toBe(opened);

    state = castVote(castVote(state, target), target);
    expect(state.phase).toBe('VOTING');
    expect(allVotesCast(state)).toBe(false);

    // Seat 3 was dealt the character everyone else is naming, so it names another.
    state = castVote(state, characterOf(state, 0));
    state = castVote(state, target);

    expect(state.phase).toBe('VOTE_REVEAL');
    expect(allVotesCast(state)).toBe(true);
    expect(voteCounts(state, CASE_001)[0]).toMatchObject({ characterId: target, votes: 3 });
    expect(voteOutcome(state, CASE_001)).toEqual({ kind: 'DECIDED', characterId: target });
  });

  it('steps through every authored truth before closing the case', () => {
    let state: GameState = { ...seatedGame(), phase: 'VOTE_REVEAL' };
    state = run(state, { type: 'SHOW_TRUTH' });
    expect(state.phase).toBe('TRUTH_REVEAL');

    for (let i = 0; i < CASE_001.truth.facts.length - 1; i += 1) {
      state = run(state, { type: 'ADVANCE_REVEAL' });
      expect(state.phase).toBe('TRUTH_REVEAL');
    }
    state = run(state, { type: 'ADVANCE_REVEAL' });
    expect(state.phase).toBe('CASE_COMPLETE');
  });

  it('can be played end to end from HOME to CASE_COMPLETE', () => {
    let state = briefAllPlayers(seatedGame());
    expect(state.phase).toBe('TABLE');

    // Every object, each followed by its discussion. Ends at the decision.
    state = playAllEvidence(state);
    expect(state.phase).toBe('DECISION_READY');

    state = run(state, { type: 'START_VOTING' });
    // Everyone names the first character they are allowed to.
    state = voteAll(state, (_seat, options) => options[0]!);
    expect(state.phase).toBe('VOTE_REVEAL');

    state = readOutVotes(state);
    state = run(state, { type: 'SHOW_TRUTH' });
    while (state.phase === 'TRUTH_REVEAL') {
      state = run(state, { type: 'ADVANCE_REVEAL' });
    }
    expect(state.phase).toBe('CASE_COMPLETE');

    state = run(state, { type: 'BACK_TO_HOME' });
    expect(state.phase).toBe('HOME');
    expect(state.caseId).toBeNull();
  });
});
