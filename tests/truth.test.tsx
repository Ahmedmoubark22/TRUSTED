import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_001_TRUTH } from '../src/content/cases/case-001/truth';
import { TRUTH_IMPORTANCE } from '../src/content/types';
import { reduce } from '../src/engine/reducer';
import {
  caseResult,
  chosenCharacter,
  currentTruthFact,
  factEvidence,
  immediateAnswerCharacter,
  revealProgress,
} from '../src/engine/selectors';
import { factAt, interpretVote, isFinalStep, orderedFacts } from '../src/engine/truth';
import type { GameState } from '../src/engine/types';
import {
  atVoting,
  characterOf,
  ctx,
  readOutVotes,
  run,
  voteAll,
} from './helpers';

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

const ANSWER = 'omar';

/** A finished vote that settled on `target`, parked at the start of the reveal. */
function revealAfterVoting(target: string): GameState {
  const base = atVoting();
  // Everyone who may name the target does. The one seat that cannot is the
  // player holding it, and their single stray vote never overtakes the rest.
  const voted = voteAll(base, (_seat, options) =>
    options.includes(target) ? target : options[0]!,
  );
  return run(readOutVotes(voted), { type: 'SHOW_TRUTH' });
}

/** A genuine two-way tie with Omar in it, built without any self-votes. */
function tiedGameNamingAnswer(): GameState {
  const base = atVoting();
  const allSeats = base.players.map((_, i) => i);
  const answerSeat = allSeats.find((s) => characterOf(base, s) === ANSWER)!;
  const otherSeat = allSeats.find((s) => s !== answerSeat)!;
  const other = characterOf(base, otherSeat);
  const rest = allSeats.filter((s) => s !== answerSeat && s !== otherSeat);

  // Two each, and nobody names themselves.
  const plan: Record<number, string> = {
    [answerSeat]: other,
    [otherSeat]: ANSWER,
    [rest[0]!]: ANSWER,
    [rest[1]!]: other,
  };
  return voteAll(base, (seat) => plan[seat]!);
}

/** Walk the reveal to its end. Ends at CASE_COMPLETE. */
function playOutReveal(state: GameState): GameState {
  let next = state;
  let guard = 0;
  while (next.phase === 'TRUTH_REVEAL') {
    next = run(next, { type: 'ADVANCE_REVEAL' });
    if ((guard += 1) > 20) throw new Error('the reveal never closed the case');
  }
  return next;
}

describe('1–2 · the approved truth is authored as data', () => {
  it('carries every approved truth of Case 001', () => {
    const all = orderedFacts(CASE_001_TRUTH)
      .flatMap((f) => [f.question, f.statement, f.explanation])
      .join(' ')
      .toLowerCase();

    // The twenty-one approved truths, checked by the claim each one makes.
    expect(all).toContain('records had been changed');
    expect(all).toContain('nadia was publicly blamed');
    expect(all).toContain('she was not responsible');
    expect(all).toContain('omar altered the records');
    expect(all).toContain('shield someone');
    expect(all).toContain('faris knew it was omar');
    expect(all).toContain('wrote it privately');
    expect(all).toContain('gave it to youssef before he died');
    expect(all).toContain('protecting the family');
    expect(all).toContain('surfaced again');
    expect(all).toContain('maya found it in the study');
    expect(all).toContain('read as far as the tear');
    expect(all).toContain('samir is faris’s son');
    expect(all).toContain('came to the house looking for the truth');
    expect(all).toContain('did not tell the room who he was');
    expect(all).toContain('realised the letter had resurfaced');
    expect(all).toContain('went into the study and took it');
    expect(all).toContain('not to bury the truth');
    expect(all).toContain('accused someone all over again');
    expect(all).toContain('missing page was the context');
    expect(all).toContain('decided that someone was better off not knowing');
  });

  it('invents nothing outside the approved story', () => {
    const all = JSON.stringify(CASE_001_TRUTH).toLowerCase();
    for (const forbidden of ['murder', 'killed', 'ghost', 'twin', 'recording', 'poison']) {
      expect(all).not.toContain(forbidden);
    }
  });

  it('gives every fact a unique id, a valid importance and a contiguous order', () => {
    const facts = orderedFacts(CASE_001_TRUTH);
    expect(new Set(facts.map((f) => f.id)).size).toBe(facts.length);
    for (const fact of facts) {
      expect(fact.id).toMatch(/^[a-z0-9-]+$/);
      expect(TRUTH_IMPORTANCE).toContain(fact.importance);
      expect(fact.question.length).toBeGreaterThan(0);
      expect(fact.statement.length).toBeGreaterThan(0);
      expect(fact.explanation.length).toBeGreaterThan(0);
    }
    expect(facts.map((f) => f.revealOrder)).toEqual(facts.map((_, i) => i));
  });

  it('names exactly one immediate fact, and it is the one the vote is read against', () => {
    const immediate = CASE_001_TRUTH.facts.filter((f) => f.importance === 'immediate');
    expect(immediate).toHaveLength(1);
    expect(immediate[0]!.id).toBe(CASE_001_TRUTH.immediateFactId);
    expect(immediate[0]!.revealOrder).toBe(0);
  });
});

describe('3 · every reveal step references real content', () => {
  it('points only at evidence and characters that exist', () => {
    const evidenceIds = CASE_001.evidence.map((e) => e.id);
    const characterIds = CASE_001.characters.map((c) => c.id);

    for (const fact of CASE_001_TRUTH.facts) {
      for (const id of fact.relatedEvidenceIds) expect(evidenceIds).toContain(id);
      for (const id of fact.relatedCharacterIds) expect(characterIds).toContain(id);
    }
  });

  it('never references evidence the slice has not built', () => {
    // E04 and E05 are a later content step; the reveal must not smuggle them in.
    const referenced = new Set(CASE_001_TRUTH.facts.flatMap((f) => f.relatedEvidenceIds));
    expect([...referenced].sort()).toEqual(['e01', 'e02', 'e03']);
  });

  it('resolves references to real objects and people', () => {
    const opening = factAt(CASE_001_TRUTH, 0)!;
    expect(factEvidence(CASE_001, opening).map((e) => e.id)).toEqual(['e03']);
    expect(immediateAnswerCharacter(CASE_001)?.name).toBe('Omar Rahman');
  });
});

describe('4–6 · the reveal walks one step at a time', () => {
  it('only runs inside TRUTH_REVEAL', () => {
    const beforeReveal = readOutVotes(
      voteAll(atVoting(), (seat) => (characterOf(atVoting(), seat) === ANSWER ? 'maya' : ANSWER)),
    );
    expect(beforeReveal.phase).toBe('VOTE_REVEAL');
    // No truth is reachable until the reveal has actually started.
    expect(currentTruthFact(beforeReveal, CASE_001)).toBeUndefined();
    expect(reduce(beforeReveal, { type: 'ADVANCE_REVEAL' }, ctx)).toBe(beforeReveal);

    const revealing = run(beforeReveal, { type: 'SHOW_TRUTH' });
    expect(revealing.phase).toBe('TRUTH_REVEAL');
    expect(revealing.revealStep).toBe(0);
    expect(currentTruthFact(revealing, CASE_001)).toBeDefined();
  });

  it('advances exactly one truth per tap', () => {
    let state = revealAfterVoting(ANSWER);
    const facts = orderedFacts(CASE_001_TRUTH);

    for (let i = 0; i < facts.length; i += 1) {
      expect(state.revealStep).toBe(i);
      expect(currentTruthFact(state, CASE_001)?.id).toBe(facts[i]!.id);
      expect(revealProgress(state, CASE_001)).toMatchObject({ step: i + 1, total: facts.length });
      state = run(state, { type: 'ADVANCE_REVEAL' });
    }
    expect(state.phase).toBe('CASE_COMPLETE');
  });

  it('cannot be advanced past the end', () => {
    const closed = playOutReveal(revealAfterVoting(ANSWER));
    expect(closed.phase).toBe('CASE_COMPLETE');
    // The reveal is over; the event is inert from here.
    expect(reduce(closed, { type: 'ADVANCE_REVEAL' }, ctx)).toBe(closed);
    expect(reduce(closed, { type: 'SHOW_TRUTH' }, ctx)).toBe(closed);
  });

  it('flags only the last step as final', () => {
    const facts = orderedFacts(CASE_001_TRUTH);
    facts.forEach((_, i) => {
      expect(isFinalStep(CASE_001_TRUTH, i)).toBe(i === facts.length - 1);
    });
  });

  it('shows one truth at a time and never the ones after it', () => {
    const state = revealAfterVoting(ANSWER);
    const html = render(state);
    const facts = orderedFacts(CASE_001_TRUTH);

    expect(html).toContain(facts[0]!.statement);
    // Later truths are not rendered-and-hidden; they are not rendered.
    for (const later of facts.slice(1)) {
      expect(html).not.toContain(later.statement);
      expect(html).not.toContain(later.explanation);
    }
  });
});

describe('7 · the first truth names who took the letter', () => {
  it('opens on Omar', () => {
    const opening = factAt(CASE_001_TRUTH, 0)!;
    expect(opening.id).toBe('who-took-the-letter');
    expect(opening.question).toBe('Who took the letter?');
    expect(opening.statement).toContain('Omar');
    expect(opening.relatedCharacterIds).toContain(ANSWER);
    expect(CASE_001_TRUTH.immediateAnswerCharacterId).toBe(ANSWER);
  });

  it('says he did not take it to bury anything', () => {
    // Approved truth 18: the reveal must not turn him into a villain.
    const why = orderedFacts(CASE_001_TRUTH)[1]!;
    expect(why.question).toBe('Why?');
    expect(why.statement.toLowerCase()).toContain('not to bury the truth');
  });
});

describe('8 · truth data is independent of voting', () => {
  it('reveals the same truths in the same order however the room voted', () => {
    const found = revealAfterVoting(ANSWER);
    const missed = revealAfterVoting('youssef');

    const walk = (start: GameState) => {
      const seen: string[] = [];
      let s = start;
      while (s.phase === 'TRUTH_REVEAL') {
        seen.push(currentTruthFact(s, CASE_001)!.id);
        s = run(s, { type: 'ADVANCE_REVEAL' });
      }
      return seen;
    };

    expect(walk(found)).toEqual(orderedFacts(CASE_001_TRUTH).map((f) => f.id));
    expect(walk(missed)).toEqual(walk(found));
  });

  it('interprets a vote without any case-specific branching', () => {
    // `interpretVote` is given an outcome and a truth; it knows no case ids.
    const truth = { ...CASE_001_TRUTH, immediateAnswerCharacterId: 'youssef' };
    expect(interpretVote({ kind: 'DECIDED', characterId: 'youssef' }, truth)).toBe(
      'FOUND_IMMEDIATE_TRUTH',
    );
    expect(interpretVote({ kind: 'DECIDED', characterId: 'omar' }, truth)).toBe(
      'MISSED_IMMEDIATE_TRUTH',
    );
  });

  it('keeps truth out of the voting module', async () => {
    const voting = await import('../src/engine/voting');
    // Nothing in voting knows what the answer is or how to judge it.
    expect(Object.keys(voting)).not.toContain('interpretVote');
    expect(JSON.stringify(Object.keys(voting))).not.toContain('truth');
  });
});

describe('9–11 · what the room found', () => {
  it('reads a decided vote for Omar as the immediate truth found', () => {
    const state = revealAfterVoting(ANSWER);
    expect(chosenCharacter(state, CASE_001)?.id).toBe(ANSWER);
    expect(caseResult(state, CASE_001)).toBe('FOUND_IMMEDIATE_TRUTH');
    expect(render(state)).toContain('You found one truth.');
  });

  it('reads a decided vote for anyone else as the immediate truth missed', () => {
    for (const other of ['maya', 'youssef', 'samir']) {
      const state = revealAfterVoting(other);
      expect(chosenCharacter(state, CASE_001)?.id).toBe(other);
      expect(caseResult(state, CASE_001)).toBe('MISSED_IMMEDIATE_TRUTH');
    }
    expect(render(revealAfterVoting('youssef'))).toContain('The room looked elsewhere.');
  });

  it('reads an unresolved split containing Omar as partial', () => {
    const tied = tiedGameNamingAnswer();
    expect(tied.phase).toBe('VOTE_REVEAL');
    expect(caseResult(tied, CASE_001)).toBe('PARTIAL_TRUTH');
    // Nobody was settled on, so there is no single chosen character.
    expect(chosenCharacter(tied, CASE_001)).toBeUndefined();

    const split = run(readOutVotes(tied), { type: 'SHOW_TRUTH' });
    expect(render(split)).toContain('Part of the room saw it.');
  });

  it('does not treat a correct vote as having found the deeper truths', () => {
    const state = revealAfterVoting(ANSWER);
    expect(caseResult(state, CASE_001)).toBe('FOUND_IMMEDIATE_TRUTH');

    // The result describes the one fact that was on the ballot. Every layer
    // under it still has to be read out, and none of them is marked found.
    const deeper = orderedFacts(CASE_001_TRUTH).filter((f) => f.importance !== 'immediate');
    expect(deeper.length).toBeGreaterThan(0);
    expect(revealProgress(state, CASE_001).isFinal).toBe(false);

    const html = render(state);
    expect(html).toContain('That was not the whole story.');
    for (const fact of deeper) expect(html).not.toContain(fact.statement);
  });
});

describe('12–13 · the ending', () => {
  it('is reachable only by walking off the final truth', () => {
    let state = revealAfterVoting(ANSWER);
    const facts = orderedFacts(CASE_001_TRUTH);

    for (let i = 0; i < facts.length - 1; i += 1) {
      state = run(state, { type: 'ADVANCE_REVEAL' });
      expect(state.phase).toBe('TRUTH_REVEAL');
    }
    expect(revealProgress(state, CASE_001).isFinal).toBe(true);
    expect(run(state, { type: 'ADVANCE_REVEAL' }).phase).toBe('CASE_COMPLETE');
  });

  it('has no event that skips the reveal', () => {
    // TRUTH_REVEAL -> CASE_COMPLETE happens through ADVANCE_REVEAL or not at
    // all, so a stray dispatch cannot jump the room to the ending.
    const start = revealAfterVoting(ANSWER);
    expect(start.revealStep).toBe(0);
    for (const event of ['SHOW_TRUTH', 'READY_TO_DECIDE', 'START_VOTING'] as const) {
      expect(reduce(start, { type: event }, ctx)).toBe(start);
    }
  });

  it('describes what the room found without grading it', () => {
    const outcomes: Array<[string, string]> = [
      [ANSWER, 'The group found part of the truth'],
      ['youssef', 'The group missed the immediate truth'],
    ];

    for (const [target, headline] of outcomes) {
      const html = render(playOutReveal(revealAfterVoting(target)));
      expect(html).toContain('Case closed');
      expect(html).toContain(headline);
      // No verdict, no score, no celebration.
      for (const banned of ['you win', 'you lose', 'was right', 'was wrong', 'correct', 'score', 'points']) {
        expect(html.toLowerCase()).not.toContain(banned);
      }
    }
  });

  it('never hard-codes a failure ending', () => {
    // The same component produces both endings from state alone.
    const found = render(playOutReveal(revealAfterVoting(ANSWER)));
    const missed = render(playOutReveal(revealAfterVoting('samir')));
    expect(found).not.toEqual(missed);
    expect(found).toContain('identified who took the letter');
    expect(missed).toContain('who took the letter');
  });
});
