import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_002 } from '../src/content/cases/case-002';
import { CASE_002_BRIEFINGS } from '../src/content/cases/case-002/briefings';
import { CASE_002_EVIDENCE } from '../src/content/cases/case-002/evidence';
import { CASE_002_TRUTH } from '../src/content/cases/case-002/truth';
import { briefedCharacterIds, getPrivateBriefing } from '../src/content/briefings';
import { getCase } from '../src/content/registry';
import { EVIDENCE_TYPES, TRUTH_IMPORTANCE } from '../src/content/types';
import type { CharacterId, EvidenceDefinition } from '../src/content/types';
import { nextEvidenceId } from '../src/engine/evidence';
import { reduce } from '../src/engine/reducer';
import {
  ballotOptions,
  caseResult,
  chosenCharacter,
  currentTruthFact,
  immediateAnswerCharacter,
  revealProgress,
  votableCharacterIds,
} from '../src/engine/selectors';
import { orderedFacts } from '../src/engine/truth';
import { createInitialState } from '../src/engine/initialState';
import type { EngineContext, GameState } from '../src/engine/types';
import type { GameEvent } from '../src/engine/events';
import { DECISION_QUESTION, decisionQuestionFor } from '../src/engine/voting';

/* --------------------------------------------------------------- machinery */

let sessions = 0;
const ctx: EngineContext = {
  now: () => 1_000,
  random: () => 0.42,
  newSessionId: () => `case002-session-${(sessions += 1)}`,
  getCase,
};

const ANSWER: CharacterId = 'mostafa';

function run(state: GameState, ...events: GameEvent[]): GameState {
  return events.reduce((s, e) => reduce(s, e, ctx), state);
}

function render(state: GameState): string {
  return renderToString(
    <GameProvider initialState={state}>
      <App />
    </GameProvider>,
  );
}

/** A Case 002 game seated and dealt, parked at the first closed briefing gate. */
function seatedGame(): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_002.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: CASE_002.minPlayers },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

/** Brief everyone in seat order, the way real taps would. Ends at TABLE. */
function briefAllPlayers(state: GameState): GameState {
  let next = state;
  for (let i = 0; i < state.players.length; i += 1) {
    next = run(next, { type: 'UNLOCK_BRIEFING' });
    let guard = 0;
    while (next.briefingStep !== 'HANDOFF') {
      next = run(next, { type: 'ADVANCE_BRIEFING_STEP' });
      if ((guard += 1) > 10) throw new Error('briefing never reached the pass screen');
    }
    next = run(next, { type: 'ADVANCE_BRIEFING' });
  }
  return next;
}

function atTable(): GameState {
  return briefAllPlayers(seatedGame());
}

/** The object the authored chain would hand the table next. */
function activeEvidence(state: GameState): EvidenceDefinition {
  const id = nextEvidenceId(CASE_002.evidence, state.revealedEvidence);
  const item = CASE_002.evidence.find((e) => e.id === id);
  if (!item) throw new Error('no evidence left in the chain');
  return item;
}

/** Open the next object and uncover every fragment. Stops before placing it. */
function placeNextEvidenceFragments(state: GameState): GameState {
  const opened = state.phase === 'EVIDENCE' ? state : run(state, { type: 'OPEN_EVIDENCE' });
  const item = activeEvidence(opened);
  let next = opened;
  for (let i = 0; i < item.fragments.length; i += 1) {
    next = run(next, { type: 'INSPECT_EVIDENCE', evidenceId: item.id });
  }
  return next;
}

/** Open, uncover every fragment, and place the next object. */
function placeNextEvidence(state: GameState): GameState {
  const read = placeNextEvidenceFragments(state);
  return run(read, { type: 'PLACE_EVIDENCE', evidenceId: activeEvidence(read).id });
}

/** Play the whole authored evidence loop. Ends at DECISION_READY. */
function atDecision(): GameState {
  let next = atTable();
  let guard = 0;
  while (next.phase !== 'DECISION_READY') {
    next = run(placeNextEvidence(next), { type: 'DISCUSSION_COMPLETE' });
    if ((guard += 1) > 20) throw new Error('evidence loop never reached the decision');
  }
  return next;
}

function atVoting(): GameState {
  return run(atDecision(), { type: 'START_VOTING' });
}

/**
 * A finished vote that settled on `target`, parked at the first truth.
 *
 * Everyone who may name the target does. The one seat that cannot is the
 * player holding it, and their single stray vote never overtakes the rest.
 */
function revealAfterVoting(target: CharacterId): GameState {
  let state = atVoting();
  for (let seat = 0; seat < state.players.length; seat += 1) {
    const voter = state.players[state.voteCursor]!;
    const options = votableCharacterIds(state, CASE_002, voter.id);
    const pick = options.includes(target) ? target : options[0]!;
    state = run(state, { type: 'UNLOCK_VOTE' }, { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: pick });
  }
  for (let i = 0; i < state.players.length; i += 1) {
    state = run(state, { type: 'ADVANCE_VOTE_REVEAL' });
  }
  return run(state, { type: 'SHOW_TRUTH' });
}

/** Walk the reveal, collecting every truth actually put on screen. */
function walkReveal(start: GameState) {
  const seen: Array<{ id: string; statement: string; explanation: string; order: number }> = [];
  let state = start;
  let guard = 0;
  while (state.phase === 'TRUTH_REVEAL') {
    const fact = currentTruthFact(state, CASE_002)!;
    seen.push({
      id: fact.id,
      statement: fact.statement,
      explanation: fact.explanation,
      order: fact.revealOrder,
    });
    state = run(state, { type: 'ADVANCE_REVEAL' });
    if ((guard += 1) > 20) throw new Error('the reveal never closed the case');
  }
  return { seen, end: state };
}

const [E01, E02, E03, E04, E05] = CASE_002_EVIDENCE;
if (!E01 || !E02 || !E03 || !E04 || !E05) throw new Error('case 002 must author five objects');

/* ------------------------------------------------------- content integrity */

describe('1 · the case is registered and playable', () => {
  it('is in the catalogue and reachable by id', () => {
    expect(getCase('case-002')).toBe(CASE_002);
    expect(CASE_002.isPlaceholder).toBe(false);
    expect(CASE_002.title).toBe('الدور');
  });

  it('is authored for exactly four players', () => {
    expect(CASE_002.minPlayers).toBe(4);
    expect(CASE_002.maxPlayers).toBe(4);
    expect(CASE_002.characters).toHaveLength(4);
  });

  it('offers exactly the approved four characters', () => {
    expect(CASE_002.characters.map((c) => c.id)).toEqual(['souad', 'hoda', 'mostafa', 'nabil']);
    expect(CASE_002.characters.map((c) => c.name)).toEqual(['سعاد', 'هدى', 'مصطفى', 'نبيل']);
  });

  it('authors a private briefing for every character, and no one else', () => {
    expect(briefedCharacterIds(CASE_002.id).sort()).toEqual(
      CASE_002.characters.map((c) => c.id).sort(),
    );
    for (const character of CASE_002.characters) {
      const briefing = getPrivateBriefing(CASE_002.id, character.id);
      expect(briefing?.characterId).toBe(character.id);
      expect(briefing?.knows.length).toBeGreaterThan(0);
      expect(briefing?.believes.length).toBeGreaterThan(0);
      expect(briefing?.hiding.length).toBeGreaterThan(0);
      expect(briefing?.goal.length).toBeGreaterThan(0);
    }
  });

  it('does not add characters the approved cast excludes', () => {
    const serialised = JSON.stringify(CASE_002.characters);
    for (const absent of ['أم نادر', 'رمضان']) expect(serialised).not.toContain(absent);
  });
});

describe('2 · exactly the five approved objects', () => {
  it('offers E01–E05 and nothing else', () => {
    expect(CASE_002.evidence.map((e) => e.id)).toEqual(['e01', 'e02', 'e03', 'e04', 'e05']);
    expect(CASE_002.evidence.map((e) => e.title)).toEqual([
      'الدفتر',
      'كشف الأدوار',
      'إيصال القاعة',
      'شاشة الموبايل',
      'الظرف',
    ]);
  });

  it('adds no sixth or seventh object', () => {
    expect(CASE_002.evidence).toHaveLength(5);
    const ids = CASE_002.evidence.map((e) => e.id);
    expect(ids).not.toContain('e06');
    expect(ids).not.toContain('e07');
  });

  it('chains them in the authored order', () => {
    expect(E01.requires).toEqual([]);
    expect(E02.requires).toEqual(['e01']);
    expect(E03.requires).toEqual(['e02']);
    expect(E04.requires).toEqual(['e03']);
    expect(E05.requires).toEqual(['e04']);
  });

  it('gives every object a type the single viewer knows how to present', () => {
    for (const item of CASE_002.evidence) {
      expect(EVIDENCE_TYPES).toContain(item.type);
      expect(item.fragments.length).toBeGreaterThan(0);
      for (const fragment of item.fragments) expect(fragment.lines.length).toBeGreaterThan(0);
    }
    expect(CASE_002.evidence.map((e) => e.type)).toEqual([
      'notebook',
      'list',
      'receipt',
      'phoneScreen',
      'envelope',
    ]);
  });

  it('carries each object’s approved surface and its approved detail', () => {
    // E01 — the missing signature, the other pen, and the overwritten row.
    const notebook = E01.fragments.flatMap((f) => f.lines).join(' ');
    expect(notebook).toContain('«تم» من غير إمضا');
    expect(notebook).toContain('بقلم جاف أسود');
    expect(notebook).toContain('٣٠,٠٠٠ مش ١٥,٠٠٠');

    // E02 — he took his turn in month two; she is last and has had nothing.
    const list = E02.fragments.flatMap((f) => f.lines).join(' ');
    expect(list).toContain('مصطفى استلم دوره من بدري');
    expect(list).toContain('هدى آخر واحدة في الدور');

    // E03 — the 45,000 is derivable from this object alone.
    const receipt = E03.fragments.flatMap((f) => f.lines).join(' ');
    expect(receipt).toContain('١٥٠٠٠ × ٣ = ٤٥٠٠٠');
    expect(receipt).toContain('اللي ماسك الدفتر');

    // E05 — sealed, complete, and never opened.
    const envelope = E05.fragments.flatMap((f) => f.lines).join(' ');
    expect(envelope).toContain('ورا السخّان');
    expect(envelope).toContain('مقفول ومختوم');
    expect(envelope).toContain('الـ٩٠,٠٠٠ كاملة');
    expect(envelope).toContain('مفيش أي محاولة فتح');
  });

  it('gives every object a discussion prompt in the approved wording', () => {
    expect(CASE_002.evidence.map((e) => e.discussionPrompt)).toEqual([
      'سعاد، ليه «تم» بتاعت مصطفى من غير إمضا؟',
      'هدى، إنتي الوحيدة اللي مخدتيش دورك. ده بيحطّك فين في الحكاية؟',
      'طب الـ٤٥ ألف راحوا فين؟',
      'مصطفى، إنت ساكت من ساعة ما قال يعدّوا. ليه؟',
      'الظرف رجع مقفول ومفيش مليم ناقص. اللي عايز يسرق بيعمل كده؟',
    ]);
  });
});

describe('3 · the decision question is this case’s own', () => {
  it('asks «مين حرّك الظرف؟» rather than the product default', () => {
    expect(CASE_002.decisionQuestion).toBe('مين حرّك الظرف؟');
    expect(decisionQuestionFor(CASE_002)).toBe('مين حرّك الظرف؟');
    expect(render(atDecision())).toContain('مين حرّك الظرف؟');
  });

  it('leaves Case 001 asking the question it always asked', () => {
    expect(CASE_001.decisionQuestion).toBeUndefined();
    expect(decisionQuestionFor(CASE_001)).toBe(DECISION_QUESTION);
    expect(decisionQuestionFor(undefined)).toBe(DECISION_QUESTION);
  });

  it('puts the four approved names on the ballot, minus the voter’s own', () => {
    const opened = run(atVoting(), { type: 'UNLOCK_VOTE' });
    const options = ballotOptions(opened, CASE_002);
    const own = opened.assignments[opened.players[0]!.id];

    expect(options).toHaveLength(3);
    expect(options.map((c) => c.id)).not.toContain(own);
    for (const option of options) {
      expect(['souad', 'hoda', 'mostafa', 'nabil']).toContain(option.id);
    }
  });
});

describe('4 · the seven-fact truth', () => {
  it('names مصطفى as the immediate answer', () => {
    expect(CASE_002_TRUTH.immediateAnswerCharacterId).toBe(ANSWER);
    expect(immediateAnswerCharacter(CASE_002)?.name).toBe('مصطفى');
  });

  it('carries exactly seven facts', () => {
    expect(CASE_002_TRUTH.facts).toHaveLength(7);
  });

  it('gives every fact a unique id, a valid importance and a contiguous order', () => {
    const facts = orderedFacts(CASE_002_TRUTH);
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
    const immediate = CASE_002_TRUTH.facts.filter((f) => f.importance === 'immediate');
    expect(immediate).toHaveLength(1);
    expect(immediate[0]!.id).toBe(CASE_002_TRUTH.immediateFactId);
    expect(immediate[0]!.revealOrder).toBe(0);
    expect(immediate[0]!.question).toBe('مين حرّك الظرف؟');
    expect(immediate[0]!.statement).toContain('مصطفى');
  });

  it('reveals the approved order', () => {
    expect(orderedFacts(CASE_002_TRUTH).map((f) => f.id)).toEqual([
      'who-moved-the-envelope',
      'not-a-theft',
      'the-money-went-in',
      'right-number-wrong-direction',
      'hoda-was-the-one-waiting',
      'the-older-story',
      'what-broke-it',
    ]);
  });

  it('points only at evidence and characters that exist in this case', () => {
    const evidenceIds = CASE_002.evidence.map((e) => e.id);
    const characterIds = CASE_002.characters.map((c) => c.id);

    for (const fact of CASE_002_TRUTH.facts) {
      for (const id of fact.relatedEvidenceIds) expect(evidenceIds).toContain(id);
      for (const id of fact.relatedCharacterIds) expect(characterIds).toContain(id);
    }
    // And every authored object is pointed at by at least one truth.
    const referenced = new Set(CASE_002_TRUTH.facts.flatMap((f) => f.relatedEvidenceIds));
    expect([...referenced].sort()).toEqual(evidenceIds);
  });

  it('states the approved mechanics and nothing outside them', () => {
    const all = orderedFacts(CASE_002_TRUTH)
      .flatMap((f) => [f.question, f.statement, f.explanation])
      .join(' ');

    expect(all).toContain('الظرف مكانش مسروق');
    expect(all).toContain('ورا السخان');
    expect(all).toContain('مش عشان الفلوس. عشان يوقف العدّ');
    expect(all).toContain('٤٥,٠٠٠ جنيه من جيبها');
    expect(all).toContain('مكانتش طالعة. كانت داخلة');
    expect(all).toContain('الرقم صح. الاتجاه غلط');
    expect(all).toContain('خمس شهور وهو قاعد في البيت');
    expect(all).toContain('الـ٩٠,٠٠٠ كاملة');
    expect(all).toContain('محدش سرق حاجة');
    // He is never called a thief, and the money never leaves the flat.
    expect(all).not.toContain('حرامي');
    expect(all).not.toContain('سرق الفلوس');
  });
});

/* ---------------------------------------------------- information boundary */

describe('5 · private briefings stay private', () => {
  it('keeps briefing text off the public case definition', () => {
    const serialised = JSON.stringify(CASE_002);
    for (const briefing of Object.values(CASE_002_BRIEFINGS)) {
      expect(serialised).not.toContain(briefing.goal);
      for (const line of [...briefing.knows, ...briefing.believes, ...briefing.hiding]) {
        expect(serialised).not.toContain(line);
      }
    }
  });

  it('keeps briefing text off the evidence, the prompts and the truth', () => {
    const publicText = JSON.stringify([CASE_002_EVIDENCE, CASE_002_TRUTH, CASE_002.intro]);
    for (const briefing of Object.values(CASE_002_BRIEFINGS)) {
      expect(publicText).not.toContain(briefing.goal);
      for (const line of [...briefing.knows, ...briefing.believes, ...briefing.hiding]) {
        expect(publicText).not.toContain(line);
      }
    }
  });

  it('never puts one character’s briefing inside another’s', () => {
    for (const own of Object.values(CASE_002_BRIEFINGS)) {
      const others = Object.values(CASE_002_BRIEFINGS).filter((b) => b !== own);
      const ownLines = [...own.knows, ...own.believes, ...own.hiding, own.goal];
      for (const other of others) {
        const otherText = JSON.stringify(other);
        for (const line of ownLines) expect(otherText).not.toContain(line);
      }
    }
  });

  it('shows one player’s briefing and no one else’s on screen', () => {
    const opened = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    let state = opened;
    let guard = 0;
    while (state.briefingStep !== 'HANDOFF') {
      state = run(state, { type: 'ADVANCE_BRIEFING_STEP' });
      if ((guard += 1) > 10) throw new Error('briefing never reached the pass screen');
    }
    // Read the fully-open briefing one step before the pass screen.
    const readable = run(opened, ...Array(4).fill({ type: 'ADVANCE_BRIEFING_STEP' } as GameEvent));
    const shownId = readable.assignments[readable.players[0]!.id]!;
    const html = render(readable);

    expect(html).toContain(CASE_002_BRIEFINGS[shownId]!.goal);
    for (const [id, briefing] of Object.entries(CASE_002_BRIEFINGS)) {
      if (id === shownId) continue;
      expect(html).not.toContain(briefing.goal);
      for (const line of briefing.hiding) expect(html).not.toContain(line);
    }
  });

  it('shows nothing at all behind a closed gate', () => {
    const html = render(seatedGame());
    for (const briefing of Object.values(CASE_002_BRIEFINGS)) {
      expect(html).not.toContain(briefing.goal);
      for (const line of briefing.knows) expect(html).not.toContain(line);
    }
  });
});

describe('6 · inspection detail only exists once the object is examined', () => {
  it('shows «اللي باين» before «اللي بيبان لما تدقّق»', () => {
    const sealed = run(atTable(), { type: 'OPEN_EVIDENCE' });
    const sealedHtml = render(sealed);
    // Sealed: the object's own surface, and none of its contents.
    expect(sealedHtml).toContain(E01.title);
    for (const line of E01.fragments.flatMap((f) => f.lines)) {
      expect(sealedHtml).not.toContain(line);
    }

    const firstTap = run(sealed, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    const firstHtml = render(firstTap);
    for (const line of E01.fragments[0]!.lines) expect(firstHtml).toContain(line);
    // The detail layer has not been reached, so it is not on the page at all.
    for (const later of E01.fragments.slice(1).flatMap((f) => f.lines)) {
      expect(firstHtml).not.toContain(later);
    }

    const secondTap = run(firstTap, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    const secondHtml = render(secondTap);
    for (const line of E01.fragments[1]!.lines) expect(secondHtml).toContain(line);
  });

  it('never names an object the chain has not reached', () => {
    const html = render(atTable());
    for (const item of CASE_002.evidence) {
      expect(html).not.toContain(item.title);
      for (const line of item.fragments.flatMap((f) => f.lines)) {
        expect(html).not.toContain(line);
      }
    }
  });
});

/* --------------------------------------------------------- cross-reference */

describe('7 · the phone digits connect E04 back to E01', () => {
  it('puts the numbers on E01’s visible layer and the digits on E04’s', () => {
    // E01, first look: the members' names *and* their phone numbers.
    expect(E01.fragments[0]!.lines.join(' ')).toContain('أرقام تليفوناتهم');
    // E01, on closer inspection: Mostafa's last four are legible.
    expect(E01.fragments[1]!.lines.join(' ')).toContain('آخره ٤ أرقام واضحة');
    // E04, first look: an unnamed number, last four digits on the lock screen.
    expect(E04.fragments[0]!.lines.join(' ')).toContain('آخر أربع أرقام باينة على الشاشة');
    expect(E04.fragments[0]!.lines.join(' ')).toContain('مش متسجّل باسم');
  });

  it('closes the match only on E04’s detail layer, and names both objects', () => {
    const detail = E04.fragments[1]!.lines.join(' ');
    expect(detail).toContain('آخر أربع أرقام في رقم مصطفى المكتوب في أول صفحة في الدفتر');
    expect(detail).toContain('الرسالة دي متبعوتة لمصطفى');
    expect(detail).toContain('الموبايل ده بتاع اللي باعتها');

    // And the object says out loud that the link needs both halves.
    const link = E04.fragments[2]!.lines.join(' ');
    expect(link).toContain('الدفتر');
    expect(link).toContain('لو الدفتر متفتحش، الأربع أرقام مش هيبقى ليها أي معنى');
  });

  it('cannot be reached before E01 has been placed', () => {
    // The chain is what enforces it: E04 requires E03 requires E02 requires E01.
    let placed: string[] = [];
    const order: string[] = [];
    for (let i = 0; i < CASE_002.evidence.length; i += 1) {
      const id = nextEvidenceId(CASE_002.evidence, placed)!;
      order.push(id);
      placed = [...placed, id];
    }
    expect(order.indexOf('e01')).toBeLessThan(order.indexOf('e04'));
    // With nothing placed, E04 is not the object on offer.
    expect(nextEvidenceId(CASE_002.evidence, [])).toBe('e01');
    expect(nextEvidenceId(CASE_002.evidence, ['e01', 'e02', 'e03'])).toBe('e04');
  });
});

/* -------------------------------------------------------- reclassification */

describe('8 · the ٤٥,٠٠٠ reclassifies the envelope', () => {
  it('states the condition on E01 and the changed reading on E05', () => {
    const trigger = E01.fragments.at(-1)!;
    expect(trigger.lines.join(' ')).toContain('أول ما الفرق بتاع الـ٤٥,٠٠٠ يتقال بصوت عالي');
    expect(trigger.lines.join(' ')).toContain('من «قضية سرقة» لـ«قضية إخفاء»');
    expect(trigger.lines.join(' ')).toContain(
      'من غير الخطوة دي، الظرف بيفضل مقفول على مستوى «حد خد الفلوس»',
    );

    const reclassified = E05.fragments.at(-1)!;
    expect(reclassified.lines.join(' ')).toContain(
      'الفلوس اللي حد استعجل يبعّدها عن العدّ',
    );
    expect(reclassified.lines.join(' ')).toContain(
      'من «مين عايز الـ٩٠ ألف؟» لـ«مين مكانش قادر يستحمل العدّ يحصل؟»',
    );
  });

  it('is derivable from E03 on its own, so it does not depend on any player speaking', () => {
    const receipt = E03.fragments.flatMap((f) => f.lines).join(' ');
    expect(receipt).toContain('٦ × ١٥٠٠٠ = ٩٠٠٠٠');
    expect(receipt).toContain('٧٥٠٠٠');
    expect(receipt).toContain('٤٥٠٠٠');
  });

  it('is unreachable until E01 has actually been read to the end', () => {
    // The table, with nothing brought out: no reclassification rule anywhere.
    expect(render(atTable())).not.toContain('قضية إخفاء');

    // E01 open, but only as far as its visible layer.
    let state = run(atTable(), { type: 'OPEN_EVIDENCE' });
    state = run(state, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    expect(render(state)).not.toContain('قضية إخفاء');

    // The detail layer names the ٤٥,٠٠٠ but not yet the consequence.
    state = run(state, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    expect(render(state)).not.toContain('قضية إخفاء');

    // The last fragment is the rule itself.
    state = run(state, { type: 'INSPECT_EVIDENCE', evidenceId: 'e01' });
    expect(render(state)).toContain('قضية إخفاء');
  });

  it('holds the changed reading back until E05 is opened at the end of the chain', () => {
    // Every earlier object placed, E05 in front of the table but still sealed.
    let state = atTable();
    for (let i = 0; i < 4; i += 1) {
      state = run(placeNextEvidence(state), { type: 'DISCUSSION_COMPLETE' });
    }
    expect(activeEvidence(state).id).toBe('e05');
    expect(render(state)).not.toContain('مين مكانش قادر يستحمل العدّ يحصل');

    const opened = placeNextEvidenceFragments(state);
    expect(render(opened)).toContain('مين مكانش قادر يستحمل العدّ يحصل');
  });
});

/* ------------------------------------------------------------------- truth */

describe('9 · the reveal walks the seven truths in order', () => {
  it('advances exactly one truth per tap and closes on the last', () => {
    let state = revealAfterVoting(ANSWER);
    const facts = orderedFacts(CASE_002_TRUTH);

    for (let i = 0; i < facts.length; i += 1) {
      expect(state.revealStep).toBe(i);
      expect(currentTruthFact(state, CASE_002)?.id).toBe(facts[i]!.id);
      expect(revealProgress(state, CASE_002)).toMatchObject({ step: i + 1, total: 7 });
      state = run(state, { type: 'ADVANCE_REVEAL' });
    }
    expect(state.phase).toBe('CASE_COMPLETE');
  });

  it('shows one truth at a time and never the ones after it', () => {
    const html = render(revealAfterVoting(ANSWER));
    const facts = orderedFacts(CASE_002_TRUTH);

    expect(html).toContain(facts[0]!.statement);
    for (const later of facts.slice(1)) {
      expect(html).not.toContain(later.explanation);
    }
  });

  it('cannot reach the ending except by walking off the final truth', () => {
    let state = revealAfterVoting(ANSWER);
    for (let i = 0; i < 6; i += 1) {
      state = run(state, { type: 'ADVANCE_REVEAL' });
      expect(state.phase).toBe('TRUTH_REVEAL');
    }
    expect(revealProgress(state, CASE_002).isFinal).toBe(true);

    // No other event jumps the room to the ending.
    for (const event of ['SHOW_TRUTH', 'READY_TO_DECIDE', 'START_VOTING'] as const) {
      expect(reduce(state, { type: event }, ctx).phase).toBe('TRUTH_REVEAL');
    }
    expect(run(state, { type: 'ADVANCE_REVEAL' }).phase).toBe('CASE_COMPLETE');
  });
});

describe('10 · the vote changes the framing and nothing else', () => {
  it('reads a decided vote for مصطفى as the immediate truth found', () => {
    const state = revealAfterVoting(ANSWER);
    expect(chosenCharacter(state, CASE_002)?.id).toBe(ANSWER);
    expect(caseResult(state, CASE_002)).toBe('FOUND_IMMEDIATE_TRUTH');
    expect(render(state)).toContain('You found one truth.');
  });

  it('reads a decided vote for anyone else as the immediate truth missed', () => {
    for (const other of ['souad', 'hoda', 'nabil'] as CharacterId[]) {
      const state = revealAfterVoting(other);
      expect(chosenCharacter(state, CASE_002)?.id).toBe(other);
      expect(caseResult(state, CASE_002)).toBe('MISSED_IMMEDIATE_TRUTH');
    }
    const missed = render(revealAfterVoting('souad'));
    expect(missed).toContain('The room looked elsewhere.');
    // The framing still names the case's own action, not another case's.
    expect(missed).toContain('حرّك الظرف');
    expect(missed).not.toContain('took the letter');
  });

  it('leaves the seven truths identical however the room voted', () => {
    const found = walkReveal(revealAfterVoting(ANSWER));
    const missed = walkReveal(revealAfterVoting('nabil'));
    const split = walkReveal(revealAfterVoting('hoda'));

    expect(found.seen).toHaveLength(7);
    expect(missed.seen).toEqual(found.seen);
    expect(split.seen).toEqual(found.seen);
    expect(found.end.phase).toBe('CASE_COMPLETE');
    expect(missed.end.phase).toBe('CASE_COMPLETE');
  });

  it('does not treat a correct vote as having found the deeper truths', () => {
    const state = revealAfterVoting(ANSWER);
    const html = render(state);
    expect(html).toContain('That was not the whole story.');
    for (const fact of orderedFacts(CASE_002_TRUTH).slice(1)) {
      expect(html).not.toContain(fact.explanation);
    }
  });

  it('never grades the table at the ending', () => {
    for (const target of [ANSWER, 'souad'] as CharacterId[]) {
      const closed = walkReveal(revealAfterVoting(target)).end;
      const html = render(closed).toLowerCase();
      for (const banned of ['you win', 'you lose', 'was right', 'was wrong', 'correct', 'score']) {
        expect(html).not.toContain(banned);
      }
    }
  });
});

describe('11 · Case 001 is untouched by any of this', () => {
  it('still holds its own characters, objects and truths', () => {
    expect(CASE_001.characters.map((c) => c.id)).toEqual(['maya', 'omar', 'youssef', 'samir']);
    expect(CASE_001.evidence.map((e) => e.id)).toEqual(['e01', 'e02', 'e03']);
    expect(CASE_001.truth.facts).toHaveLength(7);
    expect(CASE_001.truth.immediateAnswerCharacterId).toBe('omar');
  });

  it('keeps the two cases’ briefings in separate lookups', () => {
    expect(getPrivateBriefing(CASE_001.id, 'mostafa')).toBeUndefined();
    expect(getPrivateBriefing(CASE_002.id, 'omar')).toBeUndefined();
    expect(getPrivateBriefing(CASE_002.id, 'mostafa')?.identity).toBe('مصطفى');
  });
});
