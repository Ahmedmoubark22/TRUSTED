import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import type { CharacterId } from '../src/content/types';
import { canTransition } from '../src/engine/phases';
import { reduce } from '../src/engine/reducer';
import {
  activeCharacterIds,
  allVotesCast,
  ballot,
  ballotOptions,
  voteCounts,
  voteOutcome,
  voteRevealComplete,
  voteRevealLines,
  votableCharacterIds,
} from '../src/engine/selectors';
import { DECISION_QUESTION, leadingCharacters, resolveVote, tallyVotes } from '../src/engine/voting';
import type { GameState } from '../src/engine/types';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';
import {
  atDecision,
  atVoting,
  castVote,
  characterOf,
  ctx,
  readOutVotes,
  run,
  seatedGame,
  voteAll,
} from './helpers';

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

/** The four seats' characters, fixed for a given game. */
function seats(state: GameState): (seat: number) => CharacterId {
  return (seat) => characterOf(state, seat);
}

/** Seats 0, 1 and 3 name seat 2's character; seat 2 names seat 0's. */
function decisiveGame(): GameState {
  const base = atVoting();
  const c = seats(base);
  return voteAll(base, (seat) => (seat === 2 ? c(0) : c(2)));
}

/** Two votes each for seat 2's and seat 0's characters. */
function tiedGame(): GameState {
  const base = atVoting();
  const c = seats(base);
  return voteAll(base, (seat) => (seat < 2 ? c(2) : c(0)));
}

describe('1 · voting only starts from the decision', () => {
  it('refuses to start from anywhere else', () => {
    const table = atDecision();
    for (const phase of ['TABLE', 'DISCUSSION', 'EVIDENCE'] as const) {
      const elsewhere: GameState = { ...table, phase };
      expect(reduce(elsewhere, { type: 'START_VOTING' }, ctx)).toBe(elsewhere);
    }
    expect(canTransition('DISCUSSION', 'VOTING')).toBe(false);
    expect(canTransition('DECISION_READY', 'VOTING')).toBe(true);
  });

  it('starts a clean ballot behind a closed gate', () => {
    const state = atVoting();
    expect(state.phase).toBe('VOTING');
    expect(state.votes).toEqual({});
    expect(state.voteCursor).toBe(0);
    expect(state.voteStep).toBe('LOCKED');
    expect(state.revoteCandidates).toEqual([]);
    // Nothing is on the ballot until the holder confirms they are alone.
    expect(ballotOptions(state, CASE_001)).toEqual([]);
  });

  it('asks the approved question and nothing else', () => {
    expect(DECISION_QUESTION).toBe('Who do you trust least?');
    const html = render(atDecision());
    expect(html).toContain(DECISION_QUESTION);
  });
});

describe('2–6 · what a player may name', () => {
  it('offers every other active character, and only those', () => {
    const state = run(atVoting(), { type: 'UNLOCK_VOTE' });
    const voter = state.players[0]!;
    const own = state.assignments[voter.id];
    const options = ballotOptions(state, CASE_001);

    expect(options).toHaveLength(3);
    expect(options.map((c) => c.id)).not.toContain(own);
    for (const option of options) {
      expect(activeCharacterIds(state, CASE_001)).toContain(option.id);
    }
  });

  it('rejects a self-vote', () => {
    const state = run(atVoting(), { type: 'UNLOCK_VOTE' });
    const voter = state.players[0]!;
    const own = state.assignments[voter.id]!;
    expect(reduce(state, { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: own }, ctx)).toBe(
      state,
    );
    expect(votableCharacterIds(state, CASE_001, voter.id)).not.toContain(own);
  });

  it('rejects an abstention and any target that is not a real character', () => {
    const state = run(atVoting(), { type: 'UNLOCK_VOTE' });
    const voter = state.players[0]!;
    for (const targetCharacterId of ['', 'nobody', 'faris']) {
      expect(
        reduce(state, { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId }, ctx),
      ).toBe(state);
    }
    expect(state.votes).toEqual({});
  });

  it('records exactly one target per player', () => {
    const state = decisiveGame();
    expect(Object.keys(state.votes)).toHaveLength(4);
    for (const vote of ballot(state)) {
      expect(vote.submitted).toBe(true);
      expect(typeof vote.targetCharacterId).toBe('string');
    }
  });

  it('will not let a player vote twice', () => {
    const first = castVote(atVoting(), characterOf(atVoting(), 2));
    const voter = first.players[0]!;
    const opened = run(first, { type: 'UNLOCK_VOTE' });
    // The cursor has moved on, so the previous voter is refused outright.
    expect(
      reduce(opened, { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: characterOf(first, 3) }, ctx),
    ).toBe(opened);
  });

  it('cannot be submitted from behind a closed gate', () => {
    const sealed = atVoting();
    const voter = sealed.players[0]!;
    expect(
      reduce(sealed, { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: characterOf(sealed, 2) }, ctx),
    ).toBe(sealed);
  });

  it('offers no way to lock a vote before one is chosen', () => {
    const html = render(run(atVoting(), { type: 'UNLOCK_VOTE' }));
    // The action is present but inert until a character is picked.
    expect(html).toContain('Choose one');
    expect(html).toContain('disabled');
    expect(html).not.toContain('Lock vote');
  });
});

describe('7–8 · the device changes hands', () => {
  it('advances to the next player, sealed', () => {
    const base = atVoting();
    const after = castVote(base, characterOf(base, 2));

    expect(after.phase).toBe('VOTING');
    expect(after.voteCursor).toBe(1);
    // The next player arrives at a closed gate, not at a live ballot.
    expect(after.voteStep).toBe('LOCKED');
    expect(ballotOptions(after, CASE_001)).toEqual([]);
  });

  it('leaves nothing of the previous vote selected', () => {
    const base = atVoting();
    const second = run(castVote(base, characterOf(base, 2)), { type: 'UNLOCK_VOTE' });
    const html = render(second);

    // The attribute is rendered on every option, so its absence in the
    // "true" form is a real signal rather than a missing attribute.
    expect(html).toContain('aria-pressed="false"');
    // The selection is component state that was unmounted with the last
    // voter's screen — no option comes up pre-pressed for the next player.
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain('ballot__option--selected');
  });
});

describe('9 · nothing is revealed until every vote is in', () => {
  it('keeps the result pending and the readout empty mid-round', () => {
    const base = atVoting();
    const c = seats(base);
    let state = castVote(base, c(2));
    state = castVote(state, c(2));
    state = castVote(state, c(0));

    expect(allVotesCast(state)).toBe(false);
    expect(voteOutcome(state, CASE_001)).toEqual({ kind: 'PENDING' });
    // Sealed by phase, so three recorded votes still produce no readout.
    expect(voteRevealLines(state, CASE_001)).toEqual([]);
  });

  it('puts no vote on the last voter’s screen', () => {
    const base = atVoting();
    const c = seats(base);
    let state = castVote(base, c(2));
    state = castVote(state, c(2));
    state = castVote(state, c(0));
    const html = render(run(state, { type: 'UNLOCK_VOTE' }));

    // The tally arrow only ever appears in the readout.
    expect(html).not.toContain('→');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain('The group chose');
  });
});

describe('10–11 · the round completes and is counted', () => {
  it('enters the reveal once all four votes are locked', () => {
    const state = decisiveGame();
    expect(state.phase).toBe('VOTE_REVEAL');
    expect(allVotesCast(state)).toBe(true);
    expect(state.voteRevealStep).toBe(0);
  });

  it('counts the actual votes rather than anything authored', () => {
    const state = decisiveGame();
    const target = characterOf(state, 2);
    const counts = voteCounts(state, CASE_001);

    expect(counts[0]).toMatchObject({ characterId: target, votes: 3 });
    expect(counts.reduce((n, row) => n + row.votes, 0)).toBe(4);
    expect(voteOutcome(state, CASE_001)).toEqual({ kind: 'DECIDED', characterId: target });
  });

  it('reads the votes out one at a time, in seat order', () => {
    let state = decisiveGame();
    expect(voteRevealLines(state, CASE_001)).toHaveLength(0);
    expect(voteRevealComplete(state)).toBe(false);

    for (let i = 1; i <= state.players.length; i += 1) {
      state = run(state, { type: 'ADVANCE_VOTE_REVEAL' });
      expect(voteRevealLines(state, CASE_001)).toHaveLength(i);
    }
    expect(voteRevealComplete(state)).toBe(true);
    // And it stops there.
    expect(reduce(state, { type: 'ADVANCE_VOTE_REVEAL' }, ctx)).toBe(state);
  });

  it('names the right voter and target on every line', () => {
    const state = readOutVotes(decisiveGame());
    const lines = voteRevealLines(state, CASE_001);

    state.players.forEach((player, seat) => {
      const line = lines[seat];
      expect(line?.voter?.id).toBe(state.assignments[player.id]);
      expect(line?.target?.id).toBe(state.votes[player.id]);
    });
  });

  it('makes no claim about whether the room was right', () => {
    const state = readOutVotes(decisiveGame());
    const html = render(state);
    expect(html).toContain('The group chose');

    // The outcome carries a choice and nothing resembling a verdict — there
    // is no field here that could say "correct".
    const outcome = voteOutcome(state, CASE_001);
    expect(Object.keys(outcome).sort()).toEqual(['characterId', 'kind']);

    // The vote screen names who the room chose and stops there — the truth
    // it will be measured against lives in the case, not in this phase.
    const answer = CASE_001.truth.immediateAnswerCharacterId;
    expect(html).not.toContain(CASE_001.truth.facts[0]!.statement);

    // And the ending never grades the table, whichever way the vote went.
    const closed = render({ ...state, phase: 'CASE_COMPLETE' as const });
    for (const claim of ['was right', 'was wrong', 'correct', 'incorrect', 'you win']) {
      expect(closed.toLowerCase()).not.toContain(claim);
    }
    expect(answer).toBe('omar');
  });
});

describe('12–14 · ties and the single revote', () => {
  it('detects a tie instead of picking a winner', () => {
    const state = tiedGame();
    const outcome = voteOutcome(state, CASE_001);

    expect(state.phase).toBe('VOTE_REVEAL');
    expect(outcome.kind).toBe('TIE');
    if (outcome.kind !== 'TIE') throw new Error('expected a tie');
    expect(outcome.characterIds).toHaveLength(2);
    expect(outcome.characterIds).toContain(characterOf(state, 0));
    expect(outcome.characterIds).toContain(characterOf(state, 2));
  });

  it('runs the revote between the tied characters only', () => {
    const tied = tiedGame();
    const outcome = voteOutcome(tied, CASE_001);
    if (outcome.kind !== 'TIE') throw new Error('expected a tie');

    const revote = run(tied, { type: 'START_REVOTE' });
    expect(revote.phase).toBe('VOTING');
    expect(revote.votes).toEqual({});
    expect(revote.voteCursor).toBe(0);
    expect(revote.voteStep).toBe('LOCKED');
    expect(revote.revoteCandidates).toEqual(outcome.characterIds);

    // Every seat sees only tied characters, and still never itself.
    for (let seat = 0; seat < revote.players.length; seat += 1) {
      const player = revote.players[seat]!;
      const options = votableCharacterIds(revote, CASE_001, player.id);
      expect(options.length).toBeGreaterThan(0);
      for (const id of options) expect(outcome.characterIds).toContain(id);
      expect(options).not.toContain(revote.assignments[player.id]);
    }

    // A character who was not tied cannot be named.
    const untied = activeCharacterIds(revote, CASE_001).find(
      (id) => !outcome.characterIds.includes(id),
    )!;
    const opened = run(revote, { type: 'UNLOCK_VOTE' });
    expect(
      reduce(opened, { type: 'CAST_VOTE', voterId: opened.players[0]!.id, targetCharacterId: untied }, ctx),
    ).toBe(opened);
  });

  it('settles when the revote breaks the tie', () => {
    const revote = run(tiedGame(), { type: 'START_REVOTE' });
    const c = seats(revote);
    // Seats 0 and 2 are forced by the no-self-vote rule; 1 and 3 side with 0.
    const settled = voteAll(revote, (seat) => (seat === 2 ? c(0) : c(2)));

    expect(settled.phase).toBe('VOTE_REVEAL');
    expect(voteOutcome(settled, CASE_001)).toEqual({ kind: 'DECIDED', characterId: c(2) });
  });

  it('reports a second tie as a group that could not agree', () => {
    const revote = run(tiedGame(), { type: 'START_REVOTE' });
    const c = seats(revote);
    const stillTied = voteAll(revote, (seat) => (seat === 1 || seat === 2 ? c(0) : c(2)));

    const outcome = voteOutcome(stillTied, CASE_001);
    expect(outcome.kind).toBe('DEADLOCK');

    const html = render(readOutVotes(stillTied));
    expect(html).toContain('could not agree');
    expect(html).not.toContain('The group chose');
  });

  it('allows only one revote', () => {
    const revote = run(tiedGame(), { type: 'START_REVOTE' });
    const c = seats(revote);
    const stillTied = voteAll(revote, (seat) => (seat === 1 || seat === 2 ? c(0) : c(2)));

    // A deadlock is not a tie, so there is nothing left to re-run.
    expect(reduce(stillTied, { type: 'START_REVOTE' }, ctx)).toBe(stillTied);
    // And a decided round never offered one.
    const decided = decisiveGame();
    expect(reduce(decided, { type: 'START_REVOTE' }, ctx)).toBe(decided);
  });

  it('leaves a deadlocked table able to move on', () => {
    const revote = run(tiedGame(), { type: 'START_REVOTE' });
    const c = seats(revote);
    const stillTied = voteAll(revote, (seat) => (seat === 1 || seat === 2 ? c(0) : c(2)));
    expect(run(readOutVotes(stillTied), { type: 'SHOW_TRUTH' }).phase).toBe('TRUTH_REVEAL');
  });

  it('counts and resolves without needing any game state', () => {
    // The tally is plain arithmetic, so it can be checked directly.
    const tally = tallyVotes({ a: 'omar', b: 'omar', c: 'maya', d: 'maya' }, ['maya', 'omar', 'samir']);
    expect(leadingCharacters(tally).sort()).toEqual(['maya', 'omar']);
    expect(resolveVote(tally, { allVotesIn: true, hasRevoted: false }).kind).toBe('TIE');
    expect(resolveVote(tally, { allVotesIn: true, hasRevoted: true }).kind).toBe('DEADLOCK');
    expect(resolveVote(tally, { allVotesIn: false, hasRevoted: false }).kind).toBe('PENDING');
    expect(
      resolveVote(tallyVotes({ a: 'omar' }, ['maya', 'omar']), { allVotesIn: true, hasRevoted: false }),
    ).toEqual({ kind: 'DECIDED', characterId: 'omar' });
  });
});

describe('18 · a reload cannot expose a private vote', () => {
  it('restores to the gate and says the session was interrupted', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    // Someone was looking at their ballot when the page reloaded.
    const open = run(atVoting(), { type: 'UNLOCK_VOTE' });
    expect(ballotOptions(open, CASE_001)).toHaveLength(3);
    persistence.save(open);

    const restored = persistence.load();
    expect(restored?.phase).toBe('VOTING');
    expect(restored?.voteStep).toBe('LOCKED');
    expect(restored?.voteResumed).toBe(true);
    expect(ballotOptions(restored!, CASE_001)).toEqual([]);
    // The seat it belongs to is unchanged — only the gate was shut.
    expect(restored?.voteCursor).toBe(open.voteCursor);
  });

  it('keeps votes already locked in, without showing them', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const base = atVoting();
    const midway = run(castVote(base, characterOf(base, 2)), { type: 'UNLOCK_VOTE' });
    persistence.save(midway);

    const restored = persistence.load()!;
    // The completed vote survives the refresh; the round is not restarted.
    expect(Object.keys(restored.votes)).toHaveLength(1);
    expect(restored.voteStep).toBe('LOCKED');
    expect(voteRevealLines(restored, CASE_001)).toEqual([]);
    expect(render(restored)).not.toContain('aria-pressed="true"');
  });

  it('never writes an unlocked selection to storage', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    // A choice being considered lives in the voting screen, so there is no
    // field for it here at all — only locked votes reach state.
    const open = run(atVoting(), { type: 'UNLOCK_VOTE' });
    persistence.save(open);

    const raw = JSON.parse(store.get('trusted.game') ?? '{}');
    expect(raw.votes).toEqual({});
    expect(Object.keys(raw)).not.toContain('selectedCharacterId');
    expect(Object.keys(raw)).not.toContain('pendingVote');
  });

  it('does not flag an untouched ballot as interrupted', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(atVoting());
    expect(persistence.load()?.voteResumed).toBe(false);
  });

  it('clears the interrupted flag once the holder confirms', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(run(atVoting(), { type: 'UNLOCK_VOTE' }));

    const reopened = run(persistence.load()!, { type: 'UNLOCK_VOTE' });
    expect(reopened.voteResumed).toBe(false);
    expect(ballotOptions(reopened, CASE_001)).toHaveLength(3);
  });
});

describe('19 · the reveal is derived, never authored', () => {
  it('follows the votes wherever they point', () => {
    const base = atVoting();
    const c = seats(base);

    // Same table, two different outcomes — nothing about the result is fixed.
    const towardsSeatTwo = readOutVotes(voteAll(base, (seat) => (seat === 2 ? c(0) : c(2))));
    const towardsSeatThree = readOutVotes(voteAll(base, (seat) => (seat === 3 ? c(0) : c(3))));

    expect(voteOutcome(towardsSeatTwo, CASE_001)).toEqual({ kind: 'DECIDED', characterId: c(2) });
    expect(voteOutcome(towardsSeatThree, CASE_001)).toEqual({ kind: 'DECIDED', characterId: c(3) });

    const nameOf = (id: CharacterId) => CASE_001.characters.find((ch) => ch.id === id)!.name;
    expect(render(towardsSeatTwo)).toContain(nameOf(c(2)));
    expect(render(towardsSeatThree)).toContain(nameOf(c(3)));
  });

  it('has no result hard-coded anywhere in the reveal', () => {
    const state = readOutVotes(decisiveGame());
    const chosen = characterOf(state, 2);
    const others = activeCharacterIds(state, CASE_001).filter((id) => id !== chosen);
    const outcome = voteOutcome(state, CASE_001);

    expect(outcome).toEqual({ kind: 'DECIDED', characterId: chosen });
    expect(others).not.toContain(chosen);
  });

  it('shows nothing at all when there is no game', () => {
    const empty = seatedGame();
    expect(voteRevealLines(empty, CASE_001)).toEqual([]);
    expect(voteOutcome(empty, CASE_001)).toEqual({ kind: 'PENDING' });
    expect(ballotOptions(empty, CASE_001)).toEqual([]);
  });
});
