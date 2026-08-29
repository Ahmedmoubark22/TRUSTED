import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_001_BRIEFINGS } from '../src/content/cases/case-001/briefings';
import { CASE_002 } from '../src/content/cases/case-002';
import { CASES } from '../src/content/registry';
import type { CharacterId } from '../src/content/types';
import { reduce } from '../src/engine/reducer';
import {
  accusedCharacter,
  chosenCharacter,
  voteCounts,
  voteOutcome,
  voteRevealLines,
} from '../src/engine/selectors';
import { orderedFacts } from '../src/engine/truth';
import type { GameState } from '../src/engine/types';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';
import {
  atDecision,
  briefAllPlayers,
  characterOf,
  ctx,
  placeNextEvidence,
  playAllEvidence,
  readOutVotes,
  run,
  seatedGame,
  voteAll,
} from './helpers';

/**
 * The ending is three facts in a row: what the room said, what it chose, and
 * what was true. These are the tests that they stay three, stay separate, and
 * stay in that order.
 */

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

const nameOf = (id: CharacterId) => CASE_001.characters.find((c) => c.id === id)!.name;

/**
 * A finished round: the room argued for `accused` (or nobody), then voted,
 * with every seat naming `voted` except the one who cannot name themselves.
 * Parked at the first beat of the reveal.
 */
function playedRound(accused: CharacterId | null, voted: CharacterId): GameState {
  const discussion = placeNextEvidence(briefAllPlayers(seatedGame()));
  const named = accused
    ? run(discussion, { type: 'SET_ACCUSATION', characterId: accused })
    : discussion;
  const voting = run(playAllEvidence(named), { type: 'START_VOTING' });
  return voteAll(voting, (_seat, options) => (options.includes(voted) ? voted : options[0]!));
}

/** Walk the vote readout to the point where the result is on screen. */
function atResult(state: GameState): GameState {
  return readOutVotes(state);
}

describe('1 · beat one shows the accusation, and only the accusation', () => {
  it('opens on what the room had been saying, with no votes shown', () => {
    const accused = characterOf(atDecision(), 1);
    const state = playedRound(accused, characterOf(atDecision(), 2));

    expect(state.phase).toBe('VOTE_REVEAL');
    expect(state.voteRevealStep).toBe(0);

    const html = render(state);
    expect(html).toContain('The room accused');
    expect(html).toContain(nameOf(accused));
    expect(html).toContain('That was the argument, not the ballot');

    // Not a single vote has been read out yet.
    expect(voteRevealLines(state, CASE_001)).toEqual([]);
    expect(html).not.toContain('→');
    expect(html).not.toContain('The group chose');
    expect(html).toContain('Read the votes');
  });

  it('needs no new state — the empty first step was always there', () => {
    const state = playedRound(characterOf(atDecision(), 1), characterOf(atDecision(), 2));
    // The beat is derived from the existing counter, nothing else.
    expect(state.voteRevealStep).toBe(0);
    expect(run(state, { type: 'ADVANCE_VOTE_REVEAL' }).voteRevealStep).toBe(1);
  });
});

describe('2 · beat two shows the vote, separately', () => {
  it('reads the votes out one at a time and lands on the result', () => {
    const accused = characterOf(atDecision(), 1);
    const voted = characterOf(atDecision(), 2);
    let state = playedRound(accused, voted);

    state = run(state, { type: 'ADVANCE_VOTE_REVEAL' });
    expect(render(state)).toContain('Read them out');

    const result = atResult(state);
    const html = render(result);
    expect(html).toContain('The group chose');
    expect(html).toContain(nameOf(voted));
    // The truth is still behind a deliberate tap.
    expect(html).toContain('Show the truth');
    for (const fact of orderedFacts(CASE_001.truth)) {
      expect(html).not.toContain(fact.explanation);
    }
  });
});

describe('3–5 · the three facts diverge, or do not, and both read clearly', () => {
  it('shows accused and chosen as two facts even when they agree', () => {
    const same = characterOf(atDecision(), 2);
    const html = render(atResult(playedRound(same, same)));

    expect(html).toContain('Accused');
    expect(html).toContain('Chosen');
    // Both rows drawn; talking and deciding stay separate acts.
    expect(html).not.toContain('contrast--diverged');
  });

  it('marks the divergence when the room voted for somebody else', () => {
    const accused = characterOf(atDecision(), 1);
    const voted = characterOf(atDecision(), 2);
    expect(accused).not.toBe(voted);

    const result = atResult(playedRound(accused, voted));
    expect(accusedCharacter(result, CASE_001)?.id).toBe(accused);
    expect(chosenCharacter(result, CASE_001)?.id).toBe(voted);

    const html = render(result);
    expect(html).toContain('contrast--diverged');
    expect(html).toContain(nameOf(accused));
    expect(html).toContain(nameOf(voted));
  });

  it('carries a vote that differs from the truth into the truth reveal', () => {
    // Accused, chosen and responsible are three different people.
    const accused = 'youssef';
    const voted = 'maya';
    const truth = CASE_001.truth.immediateAnswerCharacterId;
    expect(new Set([accused, voted, truth]).size).toBe(3);

    const result = atResult(playedRound(accused, voted));
    const revealed = run(result, { type: 'SHOW_TRUTH' });

    expect(revealed.phase).toBe('TRUTH_REVEAL');
    // All three still readable, from three separate places in state.
    expect(revealed.accusation).toBe(accused);
    expect(chosenCharacter(revealed, CASE_001)?.id).toBe(voted);
    expect(CASE_001.truth.immediateAnswerCharacterId).toBe(truth);

    const html = render(revealed);
    expect(html).toContain('The room looked elsewhere.');
    expect(html).toContain(nameOf(voted));
    expect(html).toContain(nameOf(truth));
  });
});

describe('6 · a room that never named anyone still gets an ending', () => {
  it('opens gracefully with no accusation', () => {
    const state = playedRound(null, characterOf(atDecision(), 2));
    expect(state.accusation).toBeNull();

    const html = render(state);
    expect(html).toContain('The room named nobody');
    expect(html).toContain('Nobody');
    expect(html).not.toContain('undefined');
    expect(html).toContain('Read the votes');
  });

  it('still shows the vote result, and reaches the truth', () => {
    const voted = characterOf(atDecision(), 2);
    const result = atResult(playedRound(null, voted));

    const html = render(result);
    expect(html).toContain('The group chose');
    expect(html).toContain(nameOf(voted));
    expect(html).not.toContain('undefined');

    expect(run(result, { type: 'SHOW_TRUTH' }).phase).toBe('TRUTH_REVEAL');
  });
});

describe('7–9 · the existing vote machinery is untouched', () => {
  it('aggregates votes exactly as before', () => {
    const voted = characterOf(atDecision(), 2);
    const state = playedRound(characterOf(atDecision(), 1), voted);
    const counts = voteCounts(state, CASE_001);

    expect(counts[0]).toMatchObject({ characterId: voted, votes: 3 });
    expect(counts.reduce((n, row) => n + row.votes, 0)).toBe(4);
    expect(voteOutcome(state, CASE_001)).toEqual({ kind: 'DECIDED', characterId: voted });
  });

  it('keeps the tie and the single revote working, accusation and all', () => {
    const discussion = placeNextEvidence(briefAllPlayers(seatedGame()));
    const accused = characterOf(discussion, 1);
    const named = run(discussion, { type: 'SET_ACCUSATION', characterId: accused });
    const base = run(playAllEvidence(named), { type: 'START_VOTING' });

    const c = (seat: number) => characterOf(base, seat);
    const tied = voteAll(base, (seat) => (seat < 2 ? c(2) : c(0)));
    expect(voteOutcome(tied, CASE_001).kind).toBe('TIE');

    const shown = atResult(tied);
    const html = render(shown);
    expect(html).toContain('The room is split');
    expect(html).toContain('Vote again');
    // No single chosen character, so there is nothing to contrast against.
    expect(html).not.toContain('contrast__label');

    const revote = run(shown, { type: 'START_REVOTE' });
    expect(revote.phase).toBe('VOTING');
    expect(revote.votes).toEqual({});
    // The standing accusation survives a revote untouched.
    expect(revote.accusation).toBe(accused);
  });

  it('keeps the deadlock ending working', () => {
    const discussion = placeNextEvidence(briefAllPlayers(seatedGame()));
    const named = run(discussion, {
      type: 'SET_ACCUSATION',
      characterId: characterOf(discussion, 1),
    });
    const base = run(playAllEvidence(named), { type: 'START_VOTING' });
    const c = (seat: number) => characterOf(base, seat);

    const revote = run(atResult(voteAll(base, (seat) => (seat < 2 ? c(2) : c(0)))), {
      type: 'START_REVOTE',
    });
    const stillTied = voteAll(revote, (seat) => (seat === 1 || seat === 2 ? c(0) : c(2)));

    expect(voteOutcome(stillTied, CASE_001).kind).toBe('DEADLOCK');
    const html = render(atResult(stillTied));
    expect(html).toContain('could not agree');
    expect(html).not.toContain('The group chose');
  });
});

describe('10 · the truth is still seven steps, in order', () => {
  it('walks all seven and closes the case, for every authored case', () => {
    // Generalised over the catalogue rather than named case by case: seven
    // ordered facts is the shape of a TRUSTED reveal, not a fact about 001.
    expect(CASES).toContain(CASE_001);
    expect(CASES).toContain(CASE_002);
    for (const def of CASES) {
      expect(def.truth.facts).toHaveLength(7);
      expect(orderedFacts(def.truth).map((f) => f.revealOrder)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    }

    let state = run(atResult(playedRound('youssef', 'maya')), { type: 'SHOW_TRUTH' });
    const seen: string[] = [];
    while (state.phase === 'TRUTH_REVEAL') {
      seen.push(state.revealStep.toString());
      state = run(state, { type: 'ADVANCE_REVEAL' });
    }

    expect(seen).toHaveLength(7);
    expect(state.phase).toBe('CASE_COMPLETE');
  });

  it('does not let the accusation change which truths are told', () => {
    const walk = (accused: CharacterId | null) => {
      let s = run(atResult(playedRound(accused, 'maya')), { type: 'SHOW_TRUTH' });
      const ids: string[] = [];
      while (s.phase === 'TRUTH_REVEAL') {
        ids.push(orderedFacts(CASE_001.truth)[s.revealStep]!.id);
        s = run(s, { type: 'ADVANCE_REVEAL' });
      }
      return ids;
    };

    const authored = orderedFacts(CASE_001.truth).map((f) => f.id);
    expect(walk('youssef')).toEqual(authored);
    expect(walk('omar')).toEqual(authored);
    expect(walk(null)).toEqual(authored);
  });
});

describe('13 · nothing private leaks into the reveal', () => {
  it('shows no ballot and no briefing text on the accusation beat', () => {
    const state = playedRound(characterOf(atDecision(), 1), characterOf(atDecision(), 2));
    const html = render(state);

    // No live ballot anywhere in the reveal.
    expect(html).not.toContain('ballot__option');
    expect(html).not.toContain('aria-pressed');
    expect(html).not.toContain('Lock vote');
    expect(html).not.toContain('Pass the device. One player only.');

    for (const briefing of Object.values(CASE_001_BRIEFINGS)) {
      expect(html).not.toContain(briefing.goal);
      for (const line of briefing.hiding) expect(html).not.toContain(line);
    }
  });

  it('keeps every voter → target line sealed until it is read out', () => {
    const state = playedRound(characterOf(atDecision(), 1), characterOf(atDecision(), 2));
    // Four votes are recorded, and none of them is on the first screen.
    expect(Object.keys(state.votes)).toHaveLength(4);
    expect(render(state)).not.toContain('tally__line');

    // They appear one at a time, never all at once.
    const first = run(state, { type: 'ADVANCE_VOTE_REVEAL' });
    expect(voteRevealLines(first, CASE_001)).toHaveLength(1);
  });
});

describe('14 · session behaviour around the ending is unchanged', () => {
  it('recovers mid-reveal without a recovery gate and without losing anything', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const accused = characterOf(atDecision(), 1);
    const state = playedRound(accused, characterOf(atDecision(), 2));

    persistence.save(state);
    const restored = persistence.load()!;

    // VOTE_REVEAL is a shared screen, so it resumes directly.
    expect(restored.recoveryRequired).toBe(false);
    expect(restored.phase).toBe('VOTE_REVEAL');
    expect(restored.accusation).toBe(accused);
    expect(restored.votes).toEqual(state.votes);
  });

  it('drops a completed session rather than resurrecting its accusation', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const state = playedRound(characterOf(atDecision(), 1), characterOf(atDecision(), 2));

    persistence.save({ ...state, phase: 'CASE_COMPLETE' });

    expect(persistence.load()).toBeNull();
    const next = reduce(
      reduce(state, { type: 'RESET' }, ctx),
      { type: 'SELECT_CASE', caseId: CASE_001.id },
      ctx,
    );
    expect(next.accusation).toBeNull();
  });
});
