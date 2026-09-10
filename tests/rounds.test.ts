import { describe, expect, it } from 'vitest';
import { CASE_004 } from '../src/content/cases/case-004';
import { CASES } from '../src/content/registry';
import { getCulprits } from '../src/content/culprits';
import { getPrivateBriefing } from '../src/content/briefings';
import { createInitialState } from '../src/engine/initialState';
import {
  defaultRounds,
  randomRoomWinOdds,
  remainingSuspects,
  resolveElimination,
} from '../src/engine/rounds';
import {
  activeCharacterIds,
  currentVoter,
  revealableEliminationCardId,
  votingPlayers,
} from '../src/engine/selectors';
import type { CharacterId } from '../src/content/types';
import type { GameState } from '../src/engine/types';
import { ctx, run } from './helpers';

const CULPRIT = 'essam';

/* ------------------------------------------------------------------- pure */

describe('round arithmetic', () => {
  it('defaults the rounds a cast gets to two short of its size', () => {
    expect(defaultRounds(4)).toBe(2);
    expect(defaultRounds(5)).toBe(3);
    expect(defaultRounds(6)).toBe(4);
  });

  it('prices a random room against the three shapes being written for', () => {
    expect(randomRoomWinOdds(4, 1, 2)).toBeCloseTo(0.5);
    expect(randomRoomWinOdds(5, 1, 3)).toBeCloseTo(0.6);
    // Six players with two culprits — the shape 004's successors are for.
    expect(randomRoomWinOdds(6, 2, 4)).toBeCloseTo(0.4);
  });

  it('cannot be won by a room with fewer rounds than there are culprits', () => {
    expect(randomRoomWinOdds(6, 2, 1)).toBe(0);
  });

  it('drops both the cleared and the caught from the pool', () => {
    expect(remainingSuspects(['a', 'b', 'c', 'd'], ['b'], ['c'])).toEqual(['a', 'd']);
  });
});

describe('resolving one elimination', () => {
  const base = {
    culprits: [CULPRIT],
    caught: [],
    cleared: [],
    active: ['wessam', 'nada', 'tarek', 'hala', 'essam'],
    round: 1,
    totalRounds: 3,
  } as const;

  it('ends it the moment the last culprit is named', () => {
    const result = resolveElimination({ ...base, named: CULPRIT });
    expect(result.wasCulprit).toBe(true);
    expect(result.outcome).toBe('ROOM_WON');
  });

  it('clears an innocent and keeps going', () => {
    const result = resolveElimination({ ...base, named: 'nada' });
    expect(result.wasCulprit).toBe(false);
    expect(result.cleared).toEqual(['nada']);
    expect(result.outcome).toBe('RUNNING');
  });

  it('hands it to the culprit when the last round misses', () => {
    const result = resolveElimination({ ...base, named: 'nada', round: 3 });
    expect(result.outcome).toBe('CULPRITS_WON');
  });

  it('keeps running while a second culprit is still standing', () => {
    const two = { ...base, culprits: ['essam', 'hala'], active: [...base.active] };
    const first = resolveElimination({ ...two, named: 'hala' });
    expect(first.wasCulprit).toBe(true);
    expect(first.outcome).toBe('RUNNING');
    const second = resolveElimination({ ...two, ...first, named: 'essam', round: 2 });
    expect(second.outcome).toBe('ROOM_WON');
  });

  it('gives it to the room once nobody is left in the pool but culprits', () => {
    // Three innocents already cleared; naming the fourth leaves only عصام.
    const result = resolveElimination({
      ...base,
      cleared: ['wessam', 'nada', 'tarek'],
      named: 'hala',
      round: 1,
      totalRounds: 9,
    });
    expect(result.outcome).toBe('ROOM_WON');
  });
});

/* ------------------------------------------------------- content contract */

describe('what an interrogation case must be', () => {
  const interrogation = CASES.filter((c) => c.mode === 'interrogation');

  it('has at least one', () => {
    expect(interrogation).toContain(CASE_004);
  });

  for (const def of interrogation) {
    describe(def.id, () => {
      const culprits = getCulprits(def.id);

      it('names its culprits privately, and never on the definition', () => {
        expect(culprits.length).toBeGreaterThan(0);
        for (const id of culprits) {
          expect(def.characters.map((c) => c.id)).toContain(id);
        }
      });

      it('deals every character, so the culprit is always in the room', () => {
        expect(def.minPlayers).toBe(def.characters.length);
        expect(def.maxPlayers).toBe(def.characters.length);
      });

      it('throws suspicion on at least two people with every object', () => {
        for (const item of def.evidence) {
          expect(item.implicates ?? [], `${item.id} implicates`).not.toHaveLength(0);
          expect((item.implicates ?? []).length, `${item.id} implicates`).toBeGreaterThanOrEqual(2);
          for (const id of item.implicates ?? []) {
            expect(def.characters.map((c) => c.id)).toContain(id);
          }
        }
      });

      it('points at every culprit at least once, so the case is winnable', () => {
        const implicated = new Set(def.evidence.flatMap((e) => e.implicates ?? []));
        for (const id of culprits) expect(implicated).toContain(id);
      });

      it('gives everybody a card to spend on the way out', () => {
        for (const character of def.characters) {
          const briefing = getPrivateBriefing(def.id, character.id);
          expect(briefing?.onEliminated, `${character.id} onEliminated`).toBeTruthy();
        }
      });

      it('brings out an object for every round it runs', () => {
        const rounds = def.rounds ?? defaultRounds(def.characters.length);
        expect(def.evidence.length).toBeGreaterThanOrEqual(rounds);
      });

      it('is neither unwinnable nor unlosable for a room voting at random', () => {
        const rounds = def.rounds ?? defaultRounds(def.characters.length);
        const odds = randomRoomWinOdds(def.characters.length, culprits.length, rounds);
        expect(odds).toBeGreaterThan(0.3);
        expect(odds).toBeLessThan(0.7);
      });
    });
  }
});

/* ------------------------------------------------------- the loop, played */

/** Case 004, seated and dealt, parked at the first closed briefing gate. */
function seated(): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_004.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: CASE_004.minPlayers },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

/** Every briefing read and passed on. Ends on round one's first object. */
function briefed(): GameState {
  let state = seated();
  for (let i = 0; i < state.players.length; i += 1) {
    state = run(state, { type: 'UNLOCK_BRIEFING' });
    let guard = 0;
    while (state.briefingStep !== 'HANDOFF') {
      state = run(state, { type: 'ADVANCE_BRIEFING_STEP' });
      if ((guard += 1) > 10) throw new Error('briefing never reached the pass screen');
    }
    state = run(state, { type: 'ADVANCE_BRIEFING' });
  }
  return state;
}

/** Read the object in front of the room and put it down. Ends in INTERROGATION. */
function openTheObject(state: GameState): GameState {
  const placed = new Set(state.revealedEvidence);
  const item = CASE_004.evidence.find((e) => !placed.has(e.id));
  if (!item) throw new Error('no object left');
  let next = state;
  for (let i = 0; i < item.fragments.length; i += 1) {
    next = run(next, { type: 'INSPECT_EVIDENCE', evidenceId: item.id });
  }
  return run(next, { type: 'PLACE_EVIDENCE', evidenceId: item.id });
}

/** Whoever is playing a given character. */
function seatOf(state: GameState, characterId: CharacterId): string {
  const found = Object.entries(state.assignments).find(([, id]) => id === characterId);
  if (!found) throw new Error(`${characterId} was not dealt`);
  return found[0];
}

/**
 * Run one whole round, with the room naming `target`.
 *
 * Every voter names the same character, so the tally is never a tie — the
 * point of these tests is the loop, not the arithmetic of a split.
 */
function playRound(state: GameState, target: CharacterId): GameState {
  let next = run(openTheObject(state), { type: 'INTERROGATION_COMPLETE' });
  next = run(next, { type: 'START_VOTING' });

  const voters = votingPlayers(next);
  for (let i = 0; i < voters.length; i += 1) {
    const voter = currentVoter(next);
    if (!voter) throw new Error('ran out of voters mid-round');
    // Nobody may name themselves, so a voter holding the target names anyone
    // else — the room still lands on the target by weight of numbers.
    const fallback = activeCharacterIds(next, CASE_004).find(
      (id) => id !== next.assignments[voter.id] && id !== target,
    );
    const choice = next.assignments[voter.id] === target ? fallback : target;
    if (!choice) throw new Error('no legal vote for this seat');
    next = run(
      next,
      { type: 'UNLOCK_VOTE' },
      { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: choice },
    );
  }

  let guard = 0;
  while (next.phase === 'VOTE_REVEAL' && next.voteRevealStep < votingPlayers(next).length) {
    next = run(next, { type: 'ADVANCE_VOTE_REVEAL' });
    if ((guard += 1) > 12) throw new Error('vote reveal never finished');
  }
  return run(next, { type: 'RESOLVE_ELIMINATION' });
}

describe('playing case 004 through the engine', () => {
  it('opens onto round one rather than a table', () => {
    const state = briefed();
    expect(state.phase).toBe('EVIDENCE');
    expect(state.round).toBe(1);
    expect(state.totalRounds).toBe(3);
  });

  it('resolves the culprits once, at the deal, and holds them', () => {
    const state = seated();
    expect(state.culprits).toEqual([CULPRIT]);
  });

  it('turns an object into questions, not a discussion', () => {
    const state = openTheObject(briefed());
    expect(state.phase).toBe('INTERROGATION');
  });

  it('ends the case the moment the room names the culprit', () => {
    const state = playRound(briefed(), CULPRIT);
    expect(state.phase).toBe('ELIMINATION');
    expect(state.outcome).toBe('ROOM_WON');
    expect(state.caughtCulprits).toEqual([CULPRIT]);
    expect(run(state, { type: 'ADVANCE_ROUND' }).phase).toBe('TRUTH_REVEAL');
  });

  it('pays for a wrong name with the card that character was holding', () => {
    const state = playRound(briefed(), 'nada');
    expect(state.outcome).toBe('RUNNING');
    expect(state.clearedCharacters).toEqual(['nada']);
    expect(revealableEliminationCardId(state)).toBe('nada');
    // The card is readable on the screen that opened it, and nowhere else.
    const nextRound = run(state, { type: 'ADVANCE_ROUND' });
    expect(revealableEliminationCardId(nextRound)).toBeUndefined();
  });

  it('never puts a cleared character back on a ballot', () => {
    const state = run(playRound(briefed(), 'nada'), { type: 'ADVANCE_ROUND' });
    expect(activeCharacterIds(state, CASE_004)).not.toContain('nada');
  });

  it('takes a cleared seat out of the vote, then gives it back for the last round', () => {
    const round2 = run(playRound(briefed(), 'nada'), { type: 'ADVANCE_ROUND' });
    expect(round2.round).toBe(2);
    const sidelined = seatOf(round2, 'nada');
    expect(votingPlayers(round2).map((p) => p.id)).not.toContain(sidelined);

    const round3 = run(playRound(round2, 'tarek'), { type: 'ADVANCE_ROUND' });
    expect(round3.round).toBe(3);
    // The final round is the one that ends the case, so everybody votes on it.
    expect(votingPlayers(round3).map((p) => p.id)).toContain(sidelined);
    expect(votingPlayers(round3)).toHaveLength(round3.players.length);
  });

  it('hands it to the culprit when three rounds miss him', () => {
    let state = briefed();
    for (const name of ['nada', 'tarek', 'hala'] as const) {
      state = playRound(state, name);
      if (state.outcome === 'RUNNING') state = run(state, { type: 'ADVANCE_ROUND' });
    }
    expect(state.outcome).toBe('CULPRITS_WON');
    expect(state.caughtCulprits).toEqual([]);
    expect(run(state, { type: 'ADVANCE_ROUND' }).phase).toBe('TRUTH_REVEAL');
  });

  it('keeps each round ballot instead of overwriting it', () => {
    const round2 = run(playRound(briefed(), 'nada'), { type: 'ADVANCE_ROUND' });
    expect(round2.voteHistory).toHaveLength(1);
    expect(round2.votes).toEqual({});
    const round3 = run(playRound(round2, 'tarek'), { type: 'ADVANCE_ROUND' });
    expect(round3.voteHistory).toHaveLength(2);
  });

  it('refuses to adjudicate a reveal case', () => {
    const state = { ...createInitialState(), phase: 'VOTE_REVEAL' as const, caseId: 'case-003' };
    expect(run(state, { type: 'RESOLVE_ELIMINATION' })).toBe(state);
  });
});

describe('what the other cases keep', () => {
  it('leaves every reveal case with a full table of voters and no rounds', () => {
    for (const def of CASES.filter((c) => c.mode !== 'interrogation')) {
      const state = run(createInitialState(), { type: 'SELECT_CASE', caseId: def.id });
      expect(state.totalRounds).toBe(0);
      expect(state.culprits).toEqual([]);
      expect(votingPlayers(state)).toEqual(state.players);
    }
  });
});

describe('the engine context', () => {
  it('reaches culprits through the injected lookup, not off the case', () => {
    expect(ctx.getCulprits(CASE_004.id)).toEqual([CULPRIT]);
    expect(ctx.getCulprits('case-003')).toEqual([]);
    expect(Object.keys(CASE_004)).not.toContain('culprits');
  });
});
