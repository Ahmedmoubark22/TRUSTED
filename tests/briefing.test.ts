import { describe, expect, it } from 'vitest';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_001_BRIEFINGS } from '../src/content/cases/case-001/briefings';
import { briefedCharacterIds, getPrivateBriefing } from '../src/content/briefings';
import {
  BRIEFING_SECTIONS,
  BRIEFING_STEPS,
  visibleSections,
} from '../src/engine/briefing';
import { currentBriefingPlayer, revealableCharacterId } from '../src/engine/selectors';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';
import { sessionStorageKey } from '../src/engine/session';
import { briefOnePlayer, ctx, readBriefing, run, seatedGame } from './helpers';
import { reduce } from '../src/engine/reducer';

const PROTOTYPE_CHARACTERS = ['maya', 'omar', 'youssef', 'samir'];

describe('1 · player to character mapping', () => {
  it('gives every player exactly one character, and no character twice', () => {
    const state = seatedGame();
    const assigned = Object.values(state.assignments);

    expect(Object.keys(state.assignments)).toHaveLength(state.players.length);
    expect(new Set(assigned).size).toBe(state.players.length);
    for (const player of state.players) {
      expect(PROTOTYPE_CHARACTERS).toContain(state.assignments[player.id]);
    }
  });

  it('offers exactly the four prototype characters', () => {
    expect(CASE_001.characters.map((c) => c.id)).toEqual(PROTOTYPE_CHARACTERS);
    expect(CASE_001.characters.map((c) => c.name)).toEqual([
      'Maya Rahman',
      'Omar Rahman',
      'Youssef Adel',
      'Samir',
    ]);
  });

  it('authors a briefing for every character in the case', () => {
    expect(briefedCharacterIds(CASE_001.id).sort()).toEqual([...PROTOTYPE_CHARACTERS].sort());
  });
});

describe('2 · each character has the intended briefing', () => {
  it('Maya', () => {
    expect(CASE_001_BRIEFINGS.maya).toEqual({
      characterId: 'maya',
      identity: 'Maya Rahman',
      knows: [
        'You found an old envelope in the family study.',
        "Inside was part of Faris's letter.",
        'The letter says: "I finally know who betrayed me."',
        'The final page is missing.',
        'You noticed Omar behaving strangely after you mentioned the letter.',
      ],
      believes: ['Omar knows what happened.'],
      hiding: ['You read part of the letter before telling everyone.'],
      goal: 'Find out what Faris was trying to reveal.',
    });
  });

  it('Omar', () => {
    expect(CASE_001_BRIEFINGS.omar).toEqual({
      characterId: 'omar',
      identity: 'Omar Rahman',
      knows: [
        'You altered financial records years ago.',
        'Faris knew about it.',
        'You took the letter tonight.',
        'You know the missing page could expose several relationships.',
      ],
      believes: ['The complete truth could destroy the family.'],
      hiding: ['You took the letter.'],
      goal: 'Prevent the group from reaching a destructive false conclusion while protecting your own secret.',
    });
  });

  it('Youssef', () => {
    expect(CASE_001_BRIEFINGS.youssef).toEqual({
      characterId: 'youssef',
      identity: 'Youssef Adel',
      knows: [
        'Faris gave you the letter before his death.',
        'You kept it hidden for years.',
        'You know Nadia was not responsible for the old financial problem.',
        "You know more about Samir's connection to Faris than you initially admit.",
      ],
      believes: ['Some truths can cause more damage if revealed without context.'],
      hiding: ['You knew about the letter for years and deliberately kept it hidden.'],
      goal: 'Control how the truth emerges.',
    });
  });

  it('Samir', () => {
    expect(CASE_001_BRIEFINGS.samir).toEqual({
      characterId: 'samir',
      identity: 'Samir',
      knows: [
        'Faris was your biological father.',
        'You discovered evidence connecting you to him.',
        'You believe the letter may explain why he never acknowledged you publicly.',
      ],
      believes: ["The letter may contain the answer you've been looking for."],
      hiding: ['Your true relationship to Faris.'],
      goal: 'Discover what your father wanted you to know.',
    });
  });
});

describe('3 · briefing progression reaches every required section', () => {
  it('walks PRIVATE → identity → know → believe → hiding → goal → pass', () => {
    let state = seatedGame();
    expect(state.briefingStep).toBe('LOCKED');

    const walked = [state.briefingStep];
    state = run(state, { type: 'UNLOCK_BRIEFING' });
    walked.push(state.briefingStep);
    while (state.briefingStep !== 'HANDOFF') {
      state = run(state, { type: 'ADVANCE_BRIEFING_STEP' });
      walked.push(state.briefingStep);
    }

    expect(walked).toEqual([...BRIEFING_STEPS]);
  });

  it('has every authored section on screen by the time the player is ready', () => {
    const state = readBriefing(seatedGame());
    // GOAL is the last content step; the pass screen shows nothing.
    expect(visibleSections('GOAL')).toEqual([...BRIEFING_SECTIONS]);
    expect(visibleSections(state.briefingStep)).toEqual([...BRIEFING_SECTIONS]);
    expect(visibleSections('LOCKED')).toEqual([]);
  });

  it('reveals sections one at a time rather than all at once', () => {
    expect(visibleSections('IDENTITY')).toEqual(['IDENTITY']);
    expect(visibleSections('KNOWS')).toEqual(['IDENTITY', 'KNOWS']);
    expect(visibleSections('BELIEVES')).toEqual(['IDENTITY', 'KNOWS', 'BELIEVES']);
  });
});

describe('4 · completing a briefing advances to the next player', () => {
  it('moves the device to the next seat, closed', () => {
    const first = seatedGame();
    const firstPlayer = currentBriefingPlayer(first);

    const second = briefOnePlayer(first);
    const secondPlayer = currentBriefingPlayer(second);

    expect(second.phase).toBe('PRIVATE_BRIEFINGS');
    expect(second.briefingCursor).toBe(1);
    expect(secondPlayer?.id).not.toBe(firstPlayer?.id);
    // The next player arrives at a closed gate, not at live content.
    expect(second.briefingStep).toBe('LOCKED');
  });
});

describe('5 · the previous player’s data is no longer active', () => {
  it('stops revealing the outgoing character the moment they are done', () => {
    const first = seatedGame();
    const opened = run(first, { type: 'UNLOCK_BRIEFING' });
    const firstCharacter = revealableCharacterId(opened);
    expect(firstCharacter).toBeDefined();

    // On the pass screen the gate has already shut.
    const ready = readBriefing(first);
    expect(revealableCharacterId(ready)).toBeUndefined();

    const second = run(ready, { type: 'ADVANCE_BRIEFING' });
    expect(revealableCharacterId(second)).toBeUndefined();

    const secondOpened = run(second, { type: 'UNLOCK_BRIEFING' });
    const secondCharacter = revealableCharacterId(secondOpened);
    expect(secondCharacter).toBeDefined();
    expect(secondCharacter).not.toBe(firstCharacter);
  });

  it('never lets two characters be revealable at once', () => {
    let state = seatedGame();
    for (let i = 0; i < state.players.length; i += 1) {
      const opened = run(state, { type: 'UNLOCK_BRIEFING' });
      const revealable = revealableCharacterId(opened);
      const expected = state.assignments[state.players[state.briefingCursor]!.id];
      expect(revealable).toBe(expected);
      state = briefOnePlayer(state);
    }
  });
});

describe('6 · the last player opens the table', () => {
  it('transitions to TABLE with the briefing sealed', () => {
    let state = seatedGame();
    for (let i = 0; i < 3; i += 1) state = briefOnePlayer(state);
    expect(state.phase).toBe('PRIVATE_BRIEFINGS');
    expect(state.briefingCursor).toBe(3);

    state = briefOnePlayer(state);
    expect(state.phase).toBe('TABLE');
    expect(state.briefingStep).toBe('LOCKED');
    expect(state.briefingCursor).toBe(0);
    expect(revealableCharacterId(state)).toBeUndefined();
  });
});

describe("7 · a player cannot skip into another player's content", () => {
  it('will not hand over the device from mid-briefing', () => {
    const opened = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    // Only the pass screen may advance the cursor.
    expect(reduce(opened, { type: 'ADVANCE_BRIEFING' }, ctx)).toBe(opened);

    const midway = run(opened, { type: 'ADVANCE_BRIEFING_STEP' });
    expect(reduce(midway, { type: 'ADVANCE_BRIEFING' }, ctx)).toBe(midway);
    expect(midway.briefingCursor).toBe(0);
  });

  it('will not advance past the gate without an explicit unlock', () => {
    const gated = seatedGame();
    expect(reduce(gated, { type: 'ADVANCE_BRIEFING_STEP' }, ctx)).toBe(gated);
    expect(reduce(gated, { type: 'ADVANCE_BRIEFING' }, ctx)).toBe(gated);
    expect(revealableCharacterId(gated)).toBeUndefined();
  });

  it('will not unlock a briefing outside PRIVATE_BRIEFINGS', () => {
    const table = seatedGame();
    const atTable = { ...table, phase: 'TABLE' as const };
    expect(reduce(atTable, { type: 'UNLOCK_BRIEFING' }, ctx)).toBe(atTable);
    expect(revealableCharacterId(atTable)).toBeUndefined();
  });

  it('cannot be unlocked twice to jump ahead', () => {
    const opened = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    expect(reduce(opened, { type: 'UNLOCK_BRIEFING' }, ctx)).toBe(opened);
  });
});

describe('8 · a reload cannot expose an open briefing', () => {
  it('restores to the gate and says the session was interrupted', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);

    // Someone was mid-briefing, reading their secret, when the page reloaded.
    const exposed = run(seatedGame(), { type: 'UNLOCK_BRIEFING' }, { type: 'ADVANCE_BRIEFING_STEP' });
    expect(revealableCharacterId(exposed)).toBeDefined();
    persistence.save(exposed);

    const restored = persistence.load();
    expect(restored).not.toBeNull();
    expect(restored?.phase).toBe('PRIVATE_BRIEFINGS');
    expect(restored?.briefingStep).toBe('LOCKED');
    expect(restored?.briefingResumed).toBe(true);
    expect(revealableCharacterId(restored!)).toBeUndefined();
    // The player it belongs to is unchanged — only the gate was shut.
    expect(restored?.briefingCursor).toBe(exposed.briefingCursor);
  });

  it('clears the interrupted flag once the holder confirms', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(run(seatedGame(), { type: 'UNLOCK_BRIEFING' }));

    const restored = persistence.load()!;
    const reopened = run(restored, { type: 'UNLOCK_BRIEFING' });
    expect(reopened.briefingResumed).toBe(false);
    expect(revealableCharacterId(reopened)).toBeDefined();
  });

  it('does not flag an untouched briefing as interrupted', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(seatedGame());
    expect(persistence.load()?.briefingResumed).toBe(false);
  });

  it('never writes private content to storage in the first place', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const open = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    persistence.save(open);

    const raw = store.get(sessionStorageKey(open.sessionId!));
    // Guard against the assertion below passing because nothing was written.
    expect(raw).not.toBeNull();
    // State records who is being briefed and how far they have read — never
    // what it said. Nothing recoverable should survive in storage.
    for (const briefing of Object.values(CASE_001_BRIEFINGS)) {
      expect(raw).not.toContain(briefing.goal);
      for (const line of [...briefing.knows, ...briefing.believes, ...briefing.hiding]) {
        expect(raw).not.toContain(line);
      }
    }
  });
});

describe('content lookup is narrow', () => {
  it('returns nothing without both a case and a character', () => {
    expect(getPrivateBriefing(null, 'maya')).toBeUndefined();
    expect(getPrivateBriefing(CASE_001.id, null)).toBeUndefined();
    expect(getPrivateBriefing(CASE_001.id, 'nobody')).toBeUndefined();
    expect(getPrivateBriefing('case-999', 'maya')).toBeUndefined();
  });

  it('keeps private text off the public case definition', () => {
    // A CaseDefinition is handed to every view; secrets must not ride along.
    const serialised = JSON.stringify(CASE_001);
    for (const briefing of Object.values(CASE_001_BRIEFINGS)) {
      expect(serialised).not.toContain(briefing.goal);
      for (const line of briefing.knows) expect(serialised).not.toContain(line);
    }
  });
});
