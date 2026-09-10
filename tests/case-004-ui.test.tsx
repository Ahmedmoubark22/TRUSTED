// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { createInitialState } from '../src/engine/initialState';

/**
 * Case 004, played the way a table plays it: by tapping what is on the screen.
 *
 * Every other test in this suite dispatches events straight at the reducer.
 * That proves the engine can run the round loop — and it proved exactly that
 * while the shipped app could not, because no button ever sent the event the
 * loop turns on. A test that types its own events cannot catch a screen that
 * never sends them.
 *
 * So this one touches no events at all. It finds buttons, clicks them, and
 * reads the header the app shell prints — the same surface a player has.
 *
 * It is the only test that needs a DOM, which is why `jsdom` is a dependency
 * at all — and why it is pinned to ^26 rather than latest. jsdom 30 declares
 * `node: ^22.22.2 || ^24.15.0 || >=26.0.0`, dropping the Node 20 this package
 * still claims to support in `engines`; npm treats that as advisory and
 * installs it anyway, so the mismatch only shows up as
 * `webidl.util.markAsUncloneable is not a function` when the suite actually
 * runs on 20. jsdom 26 wants `>=18`, which leaves no gap under `>=20`.
 */

const CASE_TITLE = 'آخر واحد شافه';
const CULPRIT = 'عصام';
const INNOCENT = 'ندى';

/** Phase titles, straight from PHASE_META — what the shell header shows. */
const HEADER = {
  home: 'TRUSTED',
  intro: 'The Case',
  players: 'Players',
  roles: 'Roles',
  briefing: 'Briefing',
  evidence: 'Evidence',
  questions: 'Questions',
  ready: 'Ready?',
  vote: 'Vote',
  theVote: 'The Vote',
  theName: 'The Name',
  theTruth: 'The Truth',
} as const;

let root: Root | undefined;
let host: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
});

function mount(): void {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root!.render(
      <GameProvider initialState={createInitialState()}>
        <App />
      </GameProvider>,
    );
  });
}

function all(selector: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(selector)];
}

/**
 * The title on screen — the test's only way of knowing where it is.
 *
 * Normally that is the shell bar, which names the phase. HOME is the one
 * screen with no bar: there is no case to locate the room inside, and the
 * view's own hero carries the name instead. A player reads a title either
 * way, so this looks in both places rather than assuming the chrome.
 */
function header(): string {
  const bar = document.querySelector('.app__title')?.textContent?.trim();
  if (bar) return bar;
  return document.querySelector('.screen__title')?.textContent?.trim() ?? '';
}

function screenText(): string {
  return document.querySelector('.app__main')?.textContent ?? '';
}

function tap(el: HTMLElement | null | undefined, what: string): void {
  if (!el) throw new Error(`nothing to tap for "${what}" on the ${header()} screen`);
  act(() => {
    el.click();
  });
}

/** The one big button at the bottom of a screen, if it is enabled. */
function primary(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.btn--primary:not([disabled])');
}

/**
 * Tap the primary button until the header stops saying `title`.
 *
 * The guard is not decoration: a screen whose only button leaves it on the
 * same screen is a soft-lock, and this is what turns that into a failure
 * rather than a hang.
 */
function tapThrough(title: string, what: string, limit = 30): void {
  let taps = 0;
  while (header() === title) {
    tap(primary(), what);
    if ((taps += 1) > limit) throw new Error(`stuck on the ${title} screen after ${limit} taps`);
  }
}

/** Read the object in front of the room, then put it on the table. */
function openTheObject(): void {
  expect(header()).toBe(HEADER.evidence);
  let taps = 0;
  // The object *is* the button; it disables itself once fully uncovered.
  while (document.querySelector('.evidence__object:not([disabled])')) {
    tap(document.querySelector<HTMLElement>('.evidence__object'), 'uncover a fragment');
    if ((taps += 1) > 20) throw new Error('the object never finished uncovering');
  }
  tap(primary(), 'put it on the table');
}

/**
 * Run one whole ballot, with the room naming `target`.
 *
 * Returns how many seats actually voted — which is the thing the final-round
 * rule is about, and it is counted from the screens rather than from state.
 */
function voteFor(target: string): number {
  expect(header()).toBe(HEADER.vote);
  let seats = 0;
  let guard = 0;
  while (header() === HEADER.vote) {
    const options = all('.ballot__option');
    if (options.length === 0) {
      // The closed gate: "I am alone with the device".
      tap(primary(), 'open the ballot');
    } else {
      // Nobody may name themselves, so the seat holding the target names
      // somebody else. The room still lands on the target on numbers.
      const wanted = options.find((o) => o.textContent?.includes(target));
      tap(wanted ?? options[0], `name ${target}`);
      tap(primary(), 'lock the vote');
      seats += 1;
    }
    if ((guard += 1) > 40) throw new Error('the ballot never finished');
  }
  return seats;
}

/** Start a fresh game and tap all the way to the first object of round one. */
function playToRoundOne(): void {
  mount();

  expect(header()).toBe(HEADER.home);
  const card = all('.card').find((c) => c.textContent?.includes(CASE_TITLE));
  tap(card?.querySelector<HTMLElement>('.btn--primary'), `open ${CASE_TITLE}`);

  tapThrough(HEADER.intro, 'read the intro');
  tapThrough(HEADER.players, 'confirm the players');
  tapThrough(HEADER.roles, 'deal and confirm the roles');
  // Five briefings, each a gate, some pages and a hand-off. Same button every
  // time, so the loop does not need to know how many pages a briefing has.
  tapThrough(HEADER.briefing, 'read and pass the briefing', 80);
}

describe('case 004, played through the screens', () => {
  it('opens onto round one rather than a table', () => {
    playToRoundOne();
    expect(header()).toBe(HEADER.evidence);
    expect(screenText()).toContain('Round 1 of 3');
  });

  it('turns an object into questions, and questions into a ballot', () => {
    playToRoundOne();
    openTheObject();
    expect(header()).toBe(HEADER.questions);
    tap(primary(), 'enough, we will vote');
    expect(header()).toBe(HEADER.ready);
  });

  it('does NOT end the case when the room names an innocent', () => {
    playToRoundOne();
    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    voteFor(INNOCENT);
    tapThrough(HEADER.theVote, 'read the votes out');

    // The bug, stated as the table saw it: a wrong name ended the case.
    expect(header()).not.toBe(HEADER.theTruth);
    expect(header()).toBe(HEADER.theName);
    expect(screenText()).toContain(INNOCENT);
    expect(screenText()).toContain('They did not do it.');
    // The wrong name still has to pay the room something.
    expect(screenText()).toContain('On the way out, they said');
  });

  it('comes back for another object, another round', () => {
    playToRoundOne();
    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    voteFor(INNOCENT);
    tapThrough(HEADER.theVote, 'read the votes out');
    tap(primary(), 'next round');

    expect(header()).toBe(HEADER.evidence);
    expect(screenText()).toContain('Round 2 of 3');
  });

  it('takes the cleared seat out of the next ballot', () => {
    playToRoundOne();
    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    const roundOneSeats = voteFor(INNOCENT);
    tapThrough(HEADER.theVote, 'read the votes out');
    tap(primary(), 'next round');

    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    const roundTwoSeats = voteFor(CULPRIT);

    expect(roundOneSeats).toBe(5);
    expect(roundTwoSeats).toBe(4);
  });

  it('ends the case when the room finally names the culprit', () => {
    playToRoundOne();
    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    voteFor(INNOCENT);
    tapThrough(HEADER.theVote, 'read the votes out');
    tap(primary(), 'next round');

    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    tapThrough(HEADER.ready, 'go to the vote');
    voteFor(CULPRIT);
    tapThrough(HEADER.theVote, 'read the votes out');

    expect(header()).toBe(HEADER.theName);
    expect(screenText()).toContain(CULPRIT);
    expect(screenText()).toContain('You were right.');

    tap(primary(), 'what actually happened');
    expect(header()).toBe(HEADER.theTruth);
  });

  it('never offers a way back to a table this case does not have', () => {
    playToRoundOne();
    openTheObject();
    tapThrough(HEADER.questions, 'finish the questions');
    expect(header()).toBe(HEADER.ready);
    // `reveal` cases can step back to the table. An `interrogation` case has
    // no table phase, so offering that door drops the room on a dead screen.
    expect(screenText()).not.toContain('back to the table');
  });
});
