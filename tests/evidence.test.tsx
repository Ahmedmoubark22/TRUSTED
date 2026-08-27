import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_001_EVIDENCE } from '../src/content/cases/case-001/evidence';
import { EVIDENCE_TYPES, type EvidenceDefinition } from '../src/content/types';
import { nextEvidenceId } from '../src/engine/evidence';
import { canTransition } from '../src/engine/phases';
import { reduce } from '../src/engine/reducer';
import {
  evidenceStateOf,
  hasUnplacedEvidence,
  inspectableEvidence,
  isEvidenceFullyInspected,
  lastPlacedEvidence,
  tableEvidence,
  visibleFragments,
} from '../src/engine/selectors';
import type { GameState } from '../src/engine/types';
import {
  activeEvidence,
  briefAllPlayers,
  ctx,
  inspectEvidence,
  placeNextEvidence,
  run,
  seatedGame,
} from './helpers';

/** A briefed table with nothing placed yet. */
function atTable(): GameState {
  return briefAllPlayers(seatedGame());
}

/**
 * The table with the first object settled on it, reached the way a player
 * actually can: place E01, finish talking, then back out of the object that
 * comes next with "Not yet". A discussion itself has no way back to the table.
 */
function tableAfterFirstObject(): GameState {
  return run(
    placeNextEvidence(atTable()),
    { type: 'DISCUSSION_COMPLETE' },
    { type: 'CLOSE_EVIDENCE' },
  );
}

/** Every line of text an object would put on screen. */
function textOf(item: EvidenceDefinition): string[] {
  return [
    item.title,
    item.description,
    ...(item.discussionPrompt ? [item.discussionPrompt] : []),
    ...item.fragments.flatMap((f) => [f.caption, ...f.lines]),
  ];
}

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

const [E01, E02, E03] = CASE_001_EVIDENCE;
if (!E01 || !E02 || !E03) throw new Error('case 001 must author three objects');

describe('1 · the case exposes exactly the approved objects', () => {
  it('offers E01–E03 and nothing else', () => {
    expect(CASE_001.evidence.map((e) => e.id)).toEqual(['e01', 'e02', 'e03']);
    expect(CASE_001.evidence.map((e) => e.title)).toEqual([
      'The Invitation',
      'The Photograph',
      'The Letter',
    ]);
  });

  it('chains them in the authored order', () => {
    expect(E01.requires).toEqual([]);
    expect(E02.requires).toEqual(['e01']);
    expect(E03.requires).toEqual(['e02']);
  });

  it('gives every object a type the viewer knows how to present', () => {
    for (const item of CASE_001.evidence) {
      expect(EVIDENCE_TYPES).toContain(item.type);
      expect(item.fragments.length).toBeGreaterThan(0);
      for (const fragment of item.fragments) expect(fragment.lines.length).toBeGreaterThan(0);
    }
  });

  it('carries the central mystery on the letter, with the page unfinished', () => {
    const lines = E03.fragments.flatMap((f) => f.lines);
    expect(lines).toContain('I finally know who betrayed me.');
    expect(lines).toContain('The second page is not here.');
  });

  it('keeps private briefing content off the evidence', () => {
    // Evidence is read to the whole room. Nothing only one player knows may
    // ride along on it.
    const serialised = JSON.stringify(CASE_001_EVIDENCE);
    expect(serialised).not.toContain('You are hiding');
    expect(serialised).not.toContain('biological father');
    expect(serialised).not.toContain('altered financial records');
  });
});

describe('2 · evidence starts undiscovered', () => {
  it('puts nothing on the table when the briefings end', () => {
    const state = atTable();
    expect(state.phase).toBe('TABLE');
    expect(state.revealedEvidence).toEqual([]);
    expect(state.evidenceRevealed).toBe(0);
    expect(tableEvidence(state, CASE_001)).toEqual([]);
  });

  it('reports every object undiscovered except the one that is next', () => {
    const state = atTable();
    expect(evidenceStateOf(state, CASE_001, 'e01')).toBe('AVAILABLE');
    expect(evidenceStateOf(state, CASE_001, 'e02')).toBe('UNDISCOVERED');
    expect(evidenceStateOf(state, CASE_001, 'e03')).toBe('UNDISCOVERED');
  });

  it('shows nothing at all while the table is not in the evidence phase', () => {
    const state = atTable();
    expect(inspectableEvidence(state, CASE_001)).toBeUndefined();
    expect(visibleFragments(state, E01)).toEqual([]);
  });
});

describe('3 · evidence cannot be inspected before it is available', () => {
  it('refuses a tap naming an object further down the chain', () => {
    const open = run(atTable(), { type: 'OPEN_EVIDENCE' });
    expect(reduce(open, { type: 'INSPECT_EVIDENCE', evidenceId: 'e02' }, ctx)).toBe(open);
    expect(reduce(open, { type: 'INSPECT_EVIDENCE', evidenceId: 'e03' }, ctx)).toBe(open);
    expect(reduce(open, { type: 'INSPECT_EVIDENCE', evidenceId: 'nothing' }, ctx)).toBe(open);
  });

  it('refuses a tap from outside the evidence phase', () => {
    const table = atTable();
    expect(reduce(table, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' }, ctx)).toBe(table);

    const discussing = placeNextEvidence(table);
    expect(discussing.phase).toBe('DISCUSSION');
    expect(reduce(discussing, { type: 'INSPECT_EVIDENCE', evidenceId: 'e02' }, ctx)).toBe(
      discussing,
    );
  });

  it('will not keep uncovering an object that is already fully read', () => {
    const read = inspectEvidence(run(atTable(), { type: 'OPEN_EVIDENCE' }));
    expect(read.evidenceRevealed).toBe(E01.fragments.length);
    expect(reduce(read, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' }, ctx)).toBe(read);
  });
});

describe('4 · inspecting is not placing', () => {
  it('leaves the table untouched no matter how far the object is read', () => {
    let state = run(atTable(), { type: 'OPEN_EVIDENCE' });

    for (let i = 1; i <= E01.fragments.length; i += 1) {
      state = run(state, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
      expect(state.evidenceRevealed).toBe(i);
      expect(state.revealedEvidence).toEqual([]);
      expect(state.phase).toBe('EVIDENCE');
      expect(evidenceStateOf(state, CASE_001, 'e01')).toBe('INSPECTING');
    }
    expect(isEvidenceFullyInspected(state, E01)).toBe(true);
    expect(tableEvidence(state, CASE_001)).toEqual([]);
  });

  it('uncovers one fragment per tap, not the whole object at once', () => {
    const first = run(run(atTable(), { type: 'OPEN_EVIDENCE' }), {
      type: 'INSPECT_EVIDENCE',
      evidenceId: 'e01',
    });
    expect(visibleFragments(first, E01)).toEqual([E01.fragments[0]]);
    expect(isEvidenceFullyInspected(first, E01)).toBe(false);
  });
});

describe('5 · "put it on the table" places the object', () => {
  it('moves a fully read object onto the table', () => {
    const read = inspectEvidence(run(atTable(), { type: 'OPEN_EVIDENCE' }));
    const placed = run(read, { type: 'PLACE_EVIDENCE', evidenceId: 'e01' });

    expect(placed.revealedEvidence).toEqual(['e01']);
    expect(evidenceStateOf(placed, CASE_001, 'e01')).toBe('ON_TABLE');
    // The next object arrives sealed, not part-read.
    expect(placed.evidenceRevealed).toBe(0);
  });

  it('refuses an object nobody has finished reading', () => {
    const open = run(atTable(), { type: 'OPEN_EVIDENCE' });
    expect(reduce(open, { type: 'PLACE_EVIDENCE', evidenceId: 'e01' }, ctx)).toBe(open);

    const half = run(open, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    expect(reduce(half, { type: 'PLACE_EVIDENCE', evidenceId: 'e01' }, ctx)).toBe(half);
    expect(half.revealedEvidence).toEqual([]);
  });

  it('reseals a half-read object if the table backs out', () => {
    const half = run(run(atTable(), { type: 'OPEN_EVIDENCE' }), {
      type: 'INSPECT_EVIDENCE',
      evidenceId: 'e01',
    });
    const backed = run(half, { type: 'CLOSE_EVIDENCE' });
    expect(backed.phase).toBe('TABLE');
    expect(backed.evidenceRevealed).toBe(0);
    expect(backed.revealedEvidence).toEqual([]);
  });
});

describe('6 · only placed evidence reaches the shared table', () => {
  it('grows the table one object at a time and never more', () => {
    let state = atTable();
    const seen: string[] = [];

    for (const expected of ['e01', 'e02', 'e03']) {
      state = placeNextEvidence(state);
      seen.push(expected);
      expect(tableEvidence(state, CASE_001).map((e) => e.id)).toEqual(seen);
      state = run(state, { type: 'DISCUSSION_COMPLETE' });
    }
    expect(state.phase).toBe('DECISION_READY');
  });

  it('reports the shared table from the placed list, in placement order', () => {
    const mid: GameState = { ...atTable(), revealedEvidence: ['e01', 'e02'] };
    expect(tableEvidence(mid, CASE_001).map((e) => e.title)).toEqual([
      'The Invitation',
      'The Photograph',
    ]);
    expect(lastPlacedEvidence(mid, CASE_001)?.id).toBe('e02');
  });

  it('answers "is there more" without naming what is left', () => {
    expect(hasUnplacedEvidence(atTable(), CASE_001)).toBe(true);
    const done: GameState = { ...atTable(), revealedEvidence: ['e01', 'e02', 'e03'] };
    expect(hasUnplacedEvidence(done, CASE_001)).toBe(false);
    expect(nextEvidenceId(CASE_001.evidence, done.revealedEvidence)).toBeUndefined();
  });
});

describe('7–12 · the authored evidence loop', () => {
  it('runs table → E01 → discuss → E02 → discuss → E03 → discuss → decide', () => {
    let state = atTable();
    expect(state.phase).toBe('TABLE');

    // 7 · E01 completion advances to discussion.
    state = run(state, { type: 'OPEN_EVIDENCE' });
    expect(state.phase).toBe('EVIDENCE');
    expect(activeEvidence(state).id).toBe('e01');
    state = placeNextEvidence(state);
    expect(state.phase).toBe('DISCUSSION');
    expect(lastPlacedEvidence(state, CASE_001)?.id).toBe('e01');

    // 8 · discussion completion advances to E02.
    state = run(state, { type: 'DISCUSSION_COMPLETE' });
    expect(state.phase).toBe('EVIDENCE');
    expect(activeEvidence(state).id).toBe('e02');

    // 9 · E02 completion advances to discussion.
    state = placeNextEvidence(state);
    expect(state.phase).toBe('DISCUSSION');
    expect(lastPlacedEvidence(state, CASE_001)?.id).toBe('e02');

    // 10 · discussion completion advances to E03.
    state = run(state, { type: 'DISCUSSION_COMPLETE' });
    expect(state.phase).toBe('EVIDENCE');
    expect(activeEvidence(state).id).toBe('e03');

    // 11 · E03 completion advances to discussion.
    state = placeNextEvidence(state);
    expect(state.phase).toBe('DISCUSSION');
    expect(lastPlacedEvidence(state, CASE_001)?.id).toBe('e03');

    // 12 · the final discussion advances to the decision.
    state = run(state, { type: 'DISCUSSION_COMPLETE' });
    expect(state.phase).toBe('DECISION_READY');
    expect(state.revealedEvidence).toEqual(['e01', 'e02', 'e03']);
  });

  it('will not open evidence once every object has been placed', () => {
    const done: GameState = {
      ...atTable(),
      revealedEvidence: ['e01', 'e02', 'e03'],
    };
    expect(reduce(done, { type: 'OPEN_EVIDENCE' }, ctx)).toBe(done);
  });

  it('leaves a discussion no route back to the table', () => {
    const talking = placeNextEvidence(atTable());
    expect(talking.phase).toBe('DISCUSSION');
    // A discussion only moves forward. Both table-bound events are rejected,
    // so the phase table and the single "We're ready" button agree.
    expect(reduce(talking, { type: 'RETURN_TO_TABLE' }, ctx)).toBe(talking);
    expect(reduce(talking, { type: 'CLOSE_EVIDENCE' }, ctx)).toBe(talking);
    expect(canTransition('DISCUSSION', 'TABLE')).toBe(false);
  });

  it('does not let a stray discussion tap skip an object', () => {
    // DISCUSSION_COMPLETE is the only way out of a discussion, and it decides
    // for itself whether an object or the decision comes next.
    const talking = placeNextEvidence(atTable());
    const next = run(talking, { type: 'DISCUSSION_COMPLETE' });
    expect(next.phase).toBe('EVIDENCE');
    expect(next.revealedEvidence).toEqual(['e01']);
  });
});

describe('13 · future evidence is never rendered', () => {
  const future = (placed: string[]) =>
    CASE_001_EVIDENCE.filter((e) => !placed.includes(e.id)).flatMap(textOf);

  it('keeps everything off the empty table', () => {
    const html = render(atTable());
    for (const line of future([])) expect(html).not.toContain(line);
  });

  it('shows only the object being inspected, never the ones after it', () => {
    const open = run(atTable(), { type: 'OPEN_EVIDENCE' });
    const html = render(inspectEvidence(open));

    expect(html).toContain(E01.title);
    // Nothing beyond the object in hand — not its title, not a caption, not a
    // single line, and not the prompt it will raise later.
    for (const line of future(['e01'])) expect(html).not.toContain(line);
  });

  it('shows only what has been placed once the table has objects on it', () => {
    const table = tableAfterFirstObject();
    expect(table.phase).toBe('TABLE');
    expect(table.revealedEvidence).toEqual(['e01']);
    const html = render(table);

    expect(html).toContain(E01.title);
    for (const line of future(['e01'])) expect(html).not.toContain(line);
  });

  it('keeps the next object out of the discussion screen', () => {
    const html = render(placeNextEvidence(atTable()));
    for (const line of future(['e01'])) expect(html).not.toContain(line);
  });

  it('never puts a count of what is still hidden on screen', () => {
    // A "1 of 3" is a slower leak, not an exemption from one — it tells the
    // room exactly how much is still coming.
    const total = CASE_001.evidence.length;
    for (const state of [atTable(), tableAfterFirstObject()]) {
      const text = render(state).replace(/<[^>]*>/g, ' ');
      expect(text).not.toMatch(new RegExp(`\\b\\d+\\s*(of|/)\\s*${total}\\b`));
    }
  });

  it('cannot be made to leak by reloading mid-investigation', () => {
    // Only ids that have been placed are ever written down, so a restored
    // game has nothing in it that names an object the table has not reached.
    const half = inspectEvidence(run(placeNextEvidence(atTable()), { type: 'DISCUSSION_COMPLETE' }));
    const raw = JSON.stringify(half);

    expect(raw).toContain('e01');
    for (const line of future(['e01', 'e02'])) expect(raw).not.toContain(line);
    for (const line of textOf(E02)) expect(raw).not.toContain(line);
  });
});
