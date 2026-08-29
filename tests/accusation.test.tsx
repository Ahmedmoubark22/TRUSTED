import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_001_BRIEFINGS } from '../src/content/cases/case-001/briefings';
import { createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import { ACCUSATION_PHASES, isAccusationPhase } from '../src/engine/accusation';
import { GAME_PHASES } from '../src/engine/phases';
import {
  accusableCharacters,
  accusedCharacter,
  activeCharacterIds,
} from '../src/engine/selectors';
import type { GameState } from '../src/engine/types';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';
import { createDevGame } from '../src/app/dev/devSeed';
import {
  atDecision,
  briefAllPlayers,
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

/**
 * The accusation is what the room says; the vote is what it commits to.
 * These are the tests for the first being public, revisable, and genuinely
 * independent of the second.
 */

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

/** A briefed table with the first object placed — i.e. mid-discussion. */
function atDiscussion(): GameState {
  return placeNextEvidence(briefAllPlayers(seatedGame()));
}

/** Name somebody during the investigation, then play on to the private vote. */
function accusedThenVoting(suspect: string): GameState {
  const named = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: suspect });
  return run(playAllEvidence(named), { type: 'START_VOTING' });
}

/** The fields a vote lives in. Nothing about accusing may disturb any of them. */
function voteShapeOf(state: GameState) {
  return {
    votes: state.votes,
    voteCursor: state.voteCursor,
    voteStep: state.voteStep,
    voteResumed: state.voteResumed,
    revoteCandidates: state.revoteCandidates,
    voteRevealStep: state.voteRevealStep,
    phase: state.phase,
  };
}

describe('1 · a session begins with nobody named', () => {
  it('starts null and is never inferred from anything', () => {
    expect(createInitialState().accusation).toBeNull();
    // Not from case selection, roles, briefings or evidence either.
    expect(seatedGame().accusation).toBeNull();
    expect(briefAllPlayers(seatedGame()).accusation).toBeNull();
    expect(atDiscussion().accusation).toBeNull();
    expect(accusedCharacter(atDiscussion(), CASE_001)).toBeUndefined();
  });
});

describe('2–4 · the room names someone, and changes its mind', () => {
  it('records the accused character', () => {
    const table = atDiscussion();
    const suspect = characterOf(table, 1);

    const accused = run(table, { type: 'SET_ACCUSATION', characterId: suspect });
    expect(accused.accusation).toBe(suspect);
  });

  it('rejects anyone who is not a character in this game', () => {
    const table = atDiscussion();
    for (const bogus of ['', 'nobody', 'faris', 'mostafa']) {
      // 'mostafa' belongs to Case 002 — real elsewhere, not in play here.
      expect(reduce(table, { type: 'SET_ACCUSATION', characterId: bogus }, ctx)).toBe(table);
    }
    expect(table.accusation).toBeNull();
    // The list it validates against is the case's own, not a second copy.
    expect(activeCharacterIds(table, CASE_001)).toHaveLength(table.players.length);
  });

  it('replaces the standing accusation rather than accumulating', () => {
    const table = atDiscussion();
    const first = characterOf(table, 1);
    const second = characterOf(table, 2);
    const third = characterOf(table, 3);

    let state = run(table, { type: 'SET_ACCUSATION', characterId: first });
    expect(state.accusation).toBe(first);

    // The argument turns, twice. Several suspects are named across one
    // discussion; only the standing one is ever held.
    state = run(state, { type: 'SET_ACCUSATION', characterId: second });
    expect(state.accusation).toBe(second);

    state = run(state, { type: 'SET_ACCUSATION', characterId: third });
    expect(state.accusation).toBe(third);
    expect(state.accusation).not.toBe(first);
    expect(state.accusation).not.toBe(second);
  });

  it('treats re-naming the same person as nothing happening', () => {
    const table = atDiscussion();
    const suspect = characterOf(table, 1);
    const accused = run(table, { type: 'SET_ACCUSATION', characterId: suspect });

    // Same reference: the store skips the persist write and the notification.
    expect(reduce(accused, { type: 'SET_ACCUSATION', characterId: suspect }, ctx)).toBe(accused);
  });
});

describe('5 · the accusation is public', () => {
  it('is readable by anyone, with no accuser and no reason attached', () => {
    const table = atDiscussion();
    const suspect = characterOf(table, 1);
    const accused = run(table, { type: 'SET_ACCUSATION', characterId: suspect });

    expect(accusedCharacter(accused, CASE_001)?.id).toBe(suspect);
    // One character id and nothing else — no accuser, no timestamp, no why.
    expect(typeof accused.accusation).toBe('string');
  });

  it('offers every character in play, excluding nobody', () => {
    const table = atDiscussion();
    const options = accusableCharacters(table, CASE_001);

    expect(options).toHaveLength(table.players.length);
    // Unlike the ballot there is no self-exclusion: the room may name anyone.
    expect(options.map((c) => c.id).sort()).toEqual(activeCharacterIds(table, CASE_001).sort());
  });

  it('shows the standing accusation on the shared screens', () => {
    const table = atDiscussion();
    const suspect = characterOf(table, 1);
    const name = CASE_001.characters.find((c) => c.id === suspect)!.name;
    const accused = run(table, { type: 'SET_ACCUSATION', characterId: suspect });

    const discussion = render(accused);
    expect(discussion).toContain('The room is naming');
    expect(discussion).toContain(name);
    // And it says, every time, that this is not the vote.
    expect(discussion).toContain('not voted');

    // The same fact is on the table screen, read-only.
    const onTable = render({ ...accused, phase: 'TABLE' as const });
    expect(onTable).toContain('The room is naming');
    expect(onTable).toContain(name);
  });

  it('offers a way to name someone, and to change it', () => {
    const table = atDiscussion();
    expect(render(table)).toContain('Name someone');

    const accused = run(table, { type: 'SET_ACCUSATION', characterId: characterOf(table, 1) });
    expect(render(accused)).toContain('Name someone else');
  });
});

describe('6 · naming is not voting', () => {
  it('leaves every vote field untouched', () => {
    const table = atDiscussion();
    const before = voteShapeOf(table);

    const accused = run(table, { type: 'SET_ACCUSATION', characterId: characterOf(table, 1) });

    expect(voteShapeOf(accused)).toEqual(before);
    expect(accused.votes).toEqual({});
  });

  it('does not pre-select the accused on the ballot', () => {
    const suspect = characterOf(atDecision(), 1);
    const voting = accusedThenVoting(suspect);
    expect(voting.accusation).toBe(suspect);

    // The ballot opens with nothing chosen, exactly as it always did.
    const html = render(run(voting, { type: 'UNLOCK_VOTE' }));
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain('ballot__option--selected');
    expect(html).toContain('Choose one');
    expect(html).not.toContain('Lock vote');
  });

  it('lets the room vote for somebody other than the person it named', () => {
    // The whole point of the split: argue one name, put down another.
    const base = atDecision();
    const accusedCharacterId = characterOf(base, 0);
    const votedCharacterId = characterOf(base, 2);
    expect(accusedCharacterId).not.toBe(votedCharacterId);

    const voting = accusedThenVoting(accusedCharacterId);
    const voted = voteAll(voting, (seat) =>
      seat === 2 ? accusedCharacterId : votedCharacterId,
    );

    expect(voted.accusation).toBe(accusedCharacterId);
    expect(Object.values(voted.votes).filter((v) => v === votedCharacterId)).toHaveLength(3);
    expect(voted.accusation).not.toBe(votedCharacterId);
  });

  it('keeps accused, voted and the truth separable for a later reveal', () => {
    const base = atDecision();
    const accusedId = characterOf(base, 0);
    const votedId = characterOf(base, 2);

    const voting = accusedThenVoting(accusedId);
    const voted = voteAll(voting, (seat) => (seat === 2 ? accusedId : votedId));
    const revealed = run(readOutVotes(voted), { type: 'SHOW_TRUTH' });

    // Three distinct facts, all still readable at the reveal.
    expect(revealed.accusation).toBe(accusedId);
    expect(Object.values(revealed.votes)).toContain(votedId);
    expect(CASE_001.truth.immediateAnswerCharacterId).toBe('omar');
  });
});

describe('7 · naming cannot leak what a player privately knows', () => {
  it('stores a character and nothing that could carry a secret', () => {
    const table = atDiscussion();
    const accused = run(table, { type: 'SET_ACCUSATION', characterId: characterOf(table, 1) });

    const serialised = JSON.stringify(accused);
    for (const briefing of Object.values(CASE_001_BRIEFINGS)) {
      expect(serialised).not.toContain(briefing.goal);
      for (const line of [...briefing.knows, ...briefing.believes, ...briefing.hiding]) {
        expect(serialised).not.toContain(line);
      }
    }
  });

  it('puts no briefing text on screen when an accusation is showing', () => {
    const table = atDiscussion();
    const accused = run(table, { type: 'SET_ACCUSATION', characterId: characterOf(table, 1) });

    for (const html of [render(accused), render({ ...accused, phase: 'TABLE' as const })]) {
      for (const briefing of Object.values(CASE_001_BRIEFINGS)) {
        expect(html).not.toContain(briefing.goal);
        for (const line of briefing.hiding) expect(html).not.toContain(line);
      }
    }
  });

  it('records no reason for the accusation anywhere', () => {
    const accused = run(atDiscussion(), {
      type: 'SET_ACCUSATION',
      characterId: characterOf(atDiscussion(), 1),
    });
    for (const field of ['accusationReason', 'accusedBy', 'accusationHistory', 'suspicion']) {
      expect(Object.keys(accused)).not.toContain(field);
    }
  });
});

describe('8 · naming belongs to the investigation only', () => {
  it('is allowed in the investigation phases and refused everywhere else', () => {
    expect([...ACCUSATION_PHASES]).toEqual(['TABLE', 'EVIDENCE', 'DISCUSSION']);

    for (const phase of GAME_PHASES) {
      const seeded = { ...createDevGame(phase), accusation: null };
      const suspect = CASE_001.characters[1]!.id;
      const after = reduce(seeded, { type: 'SET_ACCUSATION', characterId: suspect }, ctx);

      if (isAccusationPhase(phase)) {
        expect(after.accusation).toBe(suspect);
      } else {
        // Refused outright — same reference, nothing written.
        expect(after).toBe(seeded);
        expect(after.accusation).toBeNull();
      }
    }
  });

  it('cannot be set while one player is alone with their briefing', () => {
    const briefing = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    expect(briefing.phase).toBe('PRIVATE_BRIEFINGS');
    expect(
      reduce(briefing, { type: 'SET_ACCUSATION', characterId: characterOf(briefing, 1) }, ctx),
    ).toBe(briefing);
  });

  it('cannot be changed once the table has said it is ready', () => {
    const suspect = characterOf(atDecision(), 1);
    const voting = accusedThenVoting(suspect);
    const other = characterOf(voting, 2);

    // The standing accusation is carried into the vote, and frozen there.
    expect(reduce(voting, { type: 'SET_ACCUSATION', characterId: other }, ctx)).toBe(voting);
    expect(voting.accusation).toBe(suspect);
  });

  it('offers no way to name anyone outside the investigation', () => {
    for (const phase of ['DECISION_READY', 'VOTING', 'TRUTH_REVEAL'] as const) {
      expect(accusableCharacters({ ...createDevGame(phase) }, CASE_001)).toEqual([]);
    }
  });
});

describe('9 · the recovery gate covers naming too', () => {
  it('refuses an accusation while a recovered session waits to be picked up', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(run(accusedThenVoting(characterOf(atDecision(), 1)), { type: 'UNLOCK_VOTE' }));

    const gated = persistence.load()!;
    expect(gated.recoveryRequired).toBe(true);
    expect(reduce(gated, { type: 'SET_ACCUSATION', characterId: characterOf(gated, 2) }, ctx)).toBe(
      gated,
    );
  });

  it('carries the standing accusation through an interrupted vote', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const suspect = characterOf(atDecision(), 1);
    persistence.save(run(accusedThenVoting(suspect), { type: 'UNLOCK_VOTE' }));

    const restored = persistence.load()!;
    expect(restored.accusation).toBe(suspect);
    expect(reduce(restored, { type: 'RESUME_SESSION' }, ctx).accusation).toBe(suspect);
  });
});

describe('10–11 · sessions do not inherit accusations', () => {
  it('clears it when a fresh case is opened', () => {
    const accused = run(atDiscussion(), {
      type: 'SET_ACCUSATION',
      characterId: characterOf(atDiscussion(), 1),
    });
    expect(accused.accusation).not.toBeNull();

    const home = reduce(accused, { type: 'RESET' }, ctx);
    const sessionB = reduce(home, { type: 'SELECT_CASE', caseId: CASE_001.id }, ctx);

    expect(sessionB.sessionId).not.toBe(accused.sessionId);
    expect(sessionB.accusation).toBeNull();
  });

  it('clears it on an explicit session restart', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const suspect = characterOf(atDecision(), 1);
    persistence.save(run(accusedThenVoting(suspect), { type: 'UNLOCK_VOTE' }));

    const restarted = reduce(persistence.load()!, { type: 'RESTART_SESSION' }, ctx);
    expect(restarted.accusation).toBeNull();
  });

  it('does not come back with a completed session', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const accused = run(atDiscussion(), {
      type: 'SET_ACCUSATION',
      characterId: characterOf(atDiscussion(), 1),
    });

    persistence.save({ ...accused, phase: 'CASE_COMPLETE' });

    // Existing behaviour: a finished case is dropped, so nothing is resurrected.
    expect(persistence.load()).toBeNull();
  });
});

describe('12 · the accusation belongs to the session', () => {
  it('persists and reloads with the rest of the game state', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const suspect = characterOf(atDiscussion(), 1);
    const accused = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: suspect });

    persistence.save(accused);
    expect(persistence.load()!.accusation).toBe(suspect);
  });

  it('is stored inside the session record, never as device-global state', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const accused = run(atDiscussion(), {
      type: 'SET_ACCUSATION',
      characterId: characterOf(atDiscussion(), 1),
    });

    persistence.save(accused);

    for (const key of ['trusted:accusation', 'trusted.accusation', 'accusation']) {
      expect(store.get(key)).toBeNull();
    }
    expect(persistence.loadSession(accused.sessionId!)!.accusation).toBe(accused.accusation);
  });

  it('survives the ordinary run of play', () => {
    const table = atDiscussion();
    const suspect = characterOf(table, 1);
    let state = run(table, { type: 'SET_ACCUSATION', characterId: suspect });

    state = playAllEvidence(state);
    expect(state.phase).toBe('DECISION_READY');
    expect(state.accusation).toBe(suspect);

    state = run(state, { type: 'START_VOTING' });
    // START_VOTING deliberately wipes the ballot; it must not wipe this.
    expect(state.votes).toEqual({});
    expect(state.accusation).toBe(suspect);

    state = castVote(state, characterOf(state, 2));
    expect(state.accusation).toBe(suspect);
  });
});
