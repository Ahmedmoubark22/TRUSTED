import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { CASE_001 } from '../src/content/cases/case-001';
import { CASE_002 } from '../src/content/cases/case-002';
import { CASE_002_BRIEFINGS } from '../src/content/cases/case-002/briefings';
import { CASE_003 } from '../src/content/cases/case-003';
import { CASE_003_BRIEFINGS } from '../src/content/cases/case-003/briefings';
import { CASE_003_EVIDENCE } from '../src/content/cases/case-003/evidence';
import { CASE_003_TRUTH } from '../src/content/cases/case-003/truth';
import { briefedCharacterIds, getPrivateBriefing } from '../src/content/briefings';
import { CASES, getCase } from '../src/content/registry';
import { EVIDENCE_TYPES, TRUTH_IMPORTANCE } from '../src/content/types';
import type { CharacterId, EvidenceDefinition, PrivateBriefing } from '../src/content/types';
import { nextEvidenceId } from '../src/engine/evidence';
import { reduce } from '../src/engine/reducer';
import { ACCUSATION_PHASES, isAccusationPhase } from '../src/engine/accusation';
import { GAME_PHASES } from '../src/engine/phases';
import {
  accusableCharacters,
  accusedCharacter,
  ballotOptions,
  caseResult,
  chosenCharacter,
  currentTruthFact,
  immediateAnswerCharacter,
  revealProgress,
  voteOutcome,
  voteRevealLines,
  votableCharacterIds,
} from '../src/engine/selectors';
import { orderedFacts } from '../src/engine/truth';
import { createInitialState } from '../src/engine/initialState';
import type { EngineContext, GameState } from '../src/engine/types';
import type { GameEvent } from '../src/engine/events';
import { decisionQuestionFor } from '../src/engine/voting';
import { createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';

/**
 * Case 003 — «الفويس».
 *
 * The case's whole design rests on one thing the earlier cases did not have to
 * prove: that the ballot question has more than one evidentially supported
 * answer. So these tests do not only check that the content is present — they
 * check that access is genuinely shared (C1), that the contradiction fires
 * against a sentence Mona was actually briefed to say (C2), that the private
 * holdings stay private, and that accusation, vote and truth can all name
 * three different people without any of it being treated as an error.
 */

/* --------------------------------------------------------------- machinery */

let sessions = 0;
const ctx: EngineContext = {
  now: () => 1_000,
  random: () => 0.42,
  newSessionId: () => `case003-session-${(sessions += 1)}`,
  getCase,
};

const ANSWER: CharacterId = 'mona';

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

/** A Case 003 game seated and dealt, parked at the first closed briefing gate. */
function seatedGame(): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_003.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: CASE_003.minPlayers },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

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
  const id = nextEvidenceId(CASE_003.evidence, state.revealedEvidence);
  const item = CASE_003.evidence.find((e) => e.id === id);
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

function placeNextEvidence(state: GameState): GameState {
  const read = placeNextEvidenceFragments(state);
  return run(read, { type: 'PLACE_EVIDENCE', evidenceId: activeEvidence(read).id });
}

/** A briefed table with the first object placed — i.e. mid-discussion. */
function atDiscussion(): GameState {
  return placeNextEvidence(atTable());
}

/** Play the whole authored evidence loop. Ends at DECISION_READY. */
function playAllEvidence(state: GameState): GameState {
  let next = state;
  let guard = 0;
  while (next.phase !== 'DECISION_READY') {
    next = run(placeNextEvidence(next), { type: 'DISCUSSION_COMPLETE' });
    if ((guard += 1) > 20) throw new Error('evidence loop never reached the decision');
  }
  return next;
}

function atDecision(): GameState {
  return playAllEvidence(atTable());
}

function atVoting(): GameState {
  return run(atDecision(), { type: 'START_VOTING' });
}

/** The character a given seat was dealt. */
function characterOf(state: GameState, seat: number): CharacterId {
  const player = state.players[seat];
  const characterId = player && state.assignments[player.id];
  if (!characterId) throw new Error(`no character dealt to seat ${seat}`);
  return characterId;
}

/** Everyone votes, in seat order, from the options that seat may actually name. */
function voteAll(
  state: GameState,
  pick: (seat: number, options: CharacterId[]) => CharacterId,
): GameState {
  let next = state;
  for (let seat = 0; seat < state.players.length; seat += 1) {
    const voter = next.players[next.voteCursor]!;
    const options = votableCharacterIds(next, CASE_003, voter.id);
    next = run(
      next,
      { type: 'UNLOCK_VOTE' },
      { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId: pick(seat, options) },
    );
  }
  return next;
}

function readOutVotes(state: GameState): GameState {
  let next = state;
  for (let i = 0; i < state.players.length; i += 1) {
    next = run(next, { type: 'ADVANCE_VOTE_REVEAL' });
  }
  return next;
}

/**
 * A full round: the room argued for `accused` (or nobody), then voted, with
 * every seat naming `voted` except the one seat that cannot name itself.
 * Parked on the first beat of the reveal.
 */
function playedRound(accused: CharacterId | null, voted: CharacterId): GameState {
  const discussion = atDiscussion();
  const named = accused
    ? run(discussion, { type: 'SET_ACCUSATION', characterId: accused })
    : discussion;
  const voting = run(playAllEvidence(named), { type: 'START_VOTING' });
  return voteAll(voting, (_seat, options) => (options.includes(voted) ? voted : options[0]!));
}

/** A finished vote that settled on `target`, parked at the first truth. */
function revealAfterVoting(target: CharacterId): GameState {
  return run(readOutVotes(playedRound(null, target)), { type: 'SHOW_TRUTH' });
}

/** Walk the reveal, collecting every truth actually put on screen. */
function walkReveal(start: GameState) {
  const seen: Array<{ id: string; statement: string; explanation: string; order: number }> = [];
  let state = start;
  let guard = 0;
  while (state.phase === 'TRUTH_REVEAL') {
    const fact = currentTruthFact(state, CASE_003)!;
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

/** Every authored line of a briefing, including the confrontation A/B. */
function briefingLines(briefing: PrivateBriefing): string[] {
  return [
    ...briefing.knows,
    ...briefing.believes,
    ...briefing.hiding,
    briefing.goal,
    ...(briefing.confrontation
      ? [briefing.confrontation.intro, briefing.confrontation.optionA, briefing.confrontation.optionB]
      : []),
  ];
}

const [EV1, EV2, EV5] = CASE_003_EVIDENCE;
if (!EV1 || !EV2 || !EV5) throw new Error('case 003 must author three public objects');

const MONA = CASE_003_BRIEFINGS.mona!;
const TAHANI = CASE_003_BRIEFINGS.tahani!;
const YASSER = CASE_003_BRIEFINGS.yasser!;
const KARIM = CASE_003_BRIEFINGS.karim!;

const textOf = (item: EvidenceDefinition) => item.fragments.flatMap((f) => f.lines).join(' ');

/* ------------------------------------------------------- content integrity */

describe('1 · the case is registered and playable', () => {
  it('is in the catalogue and reachable by id', () => {
    expect(getCase('case-003')).toBe(CASE_003);
    expect(CASES).toContain(CASE_003);
    expect(CASE_003.isPlaceholder).toBe(false);
    expect(CASE_003.title).toBe('الفويس');
  });

  it('is authored for exactly four players, in the approved band', () => {
    expect(CASE_003.minPlayers).toBe(4);
    expect(CASE_003.maxPlayers).toBe(4);
    expect(CASE_003.characters).toHaveLength(4);
    // 15–20 minutes, as re-budgeted in Revision v2.
    expect(CASE_003.estimatedMinutes).toBeGreaterThanOrEqual(15);
    expect(CASE_003.estimatedMinutes).toBeLessThanOrEqual(20);
  });

  it('offers exactly the approved four characters and nobody else', () => {
    expect(CASE_003.characters.map((c) => c.id)).toEqual(['mona', 'tahani', 'yasser', 'karim']);
    expect(CASE_003.characters.map((c) => c.name)).toEqual(['منى', 'تهاني', 'ياسر', 'كريم']);
    // عمر and سلمى are the engagement, not the cast. They are never dealt.
    const serialised = JSON.stringify(CASE_003.characters);
    for (const absent of ['عمر', 'سلمى']) expect(serialised).not.toContain(absent);
  });

  it('authors a private briefing for every character, and no one else', () => {
    expect(briefedCharacterIds(CASE_003.id).sort()).toEqual(
      CASE_003.characters.map((c) => c.id).sort(),
    );
    for (const character of CASE_003.characters) {
      const briefing = getPrivateBriefing(CASE_003.id, character.id);
      expect(briefing?.characterId).toBe(character.id);
      expect(briefing?.knows.length).toBeGreaterThan(0);
      expect(briefing?.believes.length).toBeGreaterThan(0);
      expect(briefing?.hiding.length).toBeGreaterThan(0);
      expect(briefing?.goal.length).toBeGreaterThan(0);
    }
  });

  it('states the two-admin fact publicly, before anything is dealt', () => {
    const intro = CASE_003.intro.join(' ');
    expect(intro).toContain('منى هي اللي عملت جروب العيلتين');
    expect(intro).toContain('وضافت تهاني أدمن معاها');
    expect(intro).toContain('الجروب فيه أدمنين، مش واحد');
    // And it is on screen at the intro, for everyone, before any briefing.
    const html = render(run(createInitialState(), { type: 'SELECT_CASE', caseId: CASE_003.id }));
    expect(html).toContain('وضافت تهاني أدمن معاها');
  });

  it('asks its own decision question rather than the product default', () => {
    expect(CASE_003.decisionQuestion).toBe('مين سرّب الفويس؟');
    expect(decisionQuestionFor(CASE_003)).toBe('مين سرّب الفويس؟');
    expect(render(atDecision())).toContain('مين سرّب الفويس؟');
  });
});

describe('2 · exactly the three approved public objects', () => {
  it('offers EV-1, EV-2 and EV-5 and nothing else', () => {
    expect(CASE_003.evidence.map((e) => e.id)).toEqual(['ev-1', 'ev-2', 'ev-5']);
    expect(CASE_003.evidence.map((e) => e.title)).toEqual([
      'السكرين شوت',
      'مين شاف الفويس قبل ما يتمسح',
      'صورة من صور الخطوبة — ٩:٤٧',
    ]);
    expect(CASE_003.evidence).toHaveLength(3);
  });

  it('adds no sixth or seventh object, and no EV-3/EV-4 screen', () => {
    const ids = CASE_003.evidence.map((e) => e.id);
    for (const forbidden of ['e06', 'e07', 'ev-6', 'ev-7', 'ev-3', 'ev-4']) {
      expect(ids).not.toContain(forbidden);
    }
  });

  it('chains them in the approved C7 order, with EV-5 last', () => {
    expect(EV1.requires).toEqual([]);
    expect(EV2.requires).toEqual(['ev-1']);
    expect(EV5.requires).toEqual(['ev-2']);

    // And the engine reads that order back out of the chain, not from a list.
    expect(nextEvidenceId(CASE_003.evidence, [])).toBe('ev-1');
    expect(nextEvidenceId(CASE_003.evidence, ['ev-1'])).toBe('ev-2');
    expect(nextEvidenceId(CASE_003.evidence, ['ev-1', 'ev-2'])).toBe('ev-5');
    expect(nextEvidenceId(CASE_003.evidence, ['ev-1', 'ev-2', 'ev-5'])).toBeUndefined();
  });

  it('uses only evidence types the single viewer already knows', () => {
    for (const item of CASE_003.evidence) {
      expect(EVIDENCE_TYPES).toContain(item.type);
      expect(item.fragments.length).toBeGreaterThan(0);
      for (const fragment of item.fragments) expect(fragment.lines.length).toBeGreaterThan(0);
    }
    expect(CASE_003.evidence.map((e) => e.type)).toEqual(['phoneScreen', 'list', 'photograph']);
  });

  it('gives every object a discussion prompt in the approved wording', () => {
    expect(CASE_003.evidence.map((e) => e.discussionPrompt)).toEqual([
      'الأدمن اتنين. مين فيهم كان ماسك الموبايل الساعة ٩:٤٧؟',
      'ثانيتين وتسع ثواني. مين فينا كان عارف حاجة قبل ما الفويس ينزل؟',
      'إيه تاني اللي اتقال النهاردة ومش متطابق مع الصورة؟',
    ]);
  });

  it('keeps the 9:47 / 9:49 timeline from v1 unchanged', () => {
    const screenshot = textOf(EV1);
    expect(screenshot).toContain('٩:٤٧');
    expect(screenshot).toContain('٩:٤٩');
    expect(textOf(EV5)).toContain('٩:٤٧');
  });
});

/* ------------------------------------------------------------ C1 · access */

describe('3 · EV-1 establishes shared access, and names nobody', () => {
  it('says an admin added the number, and refuses to say which admin', () => {
    const detail = EV1.fragments[1]!.lines.join(' ');
    expect(detail).toContain('اتضاف للجروب مباشرة بواسطة أدمن');
    expect(detail).toContain('مش عن طريق لينك دعوة');
    // The number leaves at 9:50 and the add-log goes with it. This is C1.
    expect(detail).toContain('خرج من الجروب ٩:٥٠');
    expect(detail).toContain('مبقاش باين أنهي أدمن');
    expect(detail).toContain('الجروب فيه أدمنين: منى وتهاني');
  });

  it('supports Mona and Tahani equally, and does not single either out', () => {
    const all = textOf(EV1);
    // Both names appear, and only in the same sentence — the one that says
    // there are two of them.
    expect(all).toContain('منى وتهاني');
    for (const claim of ['منى ضافت', 'تهاني ضافت', 'منى هي اللي ضافت', 'منى سرّبت']) {
      expect(all).not.toContain(claim);
    }
    // And no other character has access from this object.
    expect(all).not.toContain('ياسر');
    expect(all).not.toContain('كريم');
  });

  it('gives Karim the structural defence the design promises him', () => {
    // He is not an admin, which is why his suspicion has to come from
    // elsewhere. It is in his briefing, not in the public object.
    expect(KARIM.knows.join(' ')).toContain('مش أدمن في الجروب');
    expect(KARIM.knows.join(' ')).toContain('مكنتش تقدر تضيف الرقم');
  });
});

/* ------------------------------------------------- C3 · four screenshotters */

describe('4 · EV-2 names all four, with the approved timings', () => {
  it('lists exactly the four characters in play', () => {
    const surface = EV2.fragments[0]!.lines.join(' ');
    for (const name of ['منى', 'تهاني', 'كريم', 'ياسر']) {
      expect(surface).toContain(name);
    }
    expect(surface).toContain('أربعة أخدوا سكرين شوت');
  });

  it('carries the Revision v2 timings exactly', () => {
    const timings = EV2.fragments[1]!.lines;
    expect(timings[0]).toContain('منى');
    expect(timings[0]).toContain('٢ ثانية');
    expect(timings[1]).toContain('تهاني');
    expect(timings[1]).toContain('٩ ثواني');
    expect(timings[2]).toContain('كريم');
    expect(timings[2]).toContain('٤٧ ثانية');
    expect(timings[3]).toContain('ياسر');
    expect(timings[3]).toContain('١ دقيقة و٥٠ ثانية');
  });

  it('gives at least two of them a believable explanation, and Mona none', () => {
    const timings = EV2.fragments[1]!.lines.join(' ');
    expect(timings).toContain('كانت بتكلم البوفيه على الواتساب'); // تهاني
    expect(timings).toContain('كان بيسلّم على ناس'); // ياسر
    expect(timings).toContain('كان بره على التليفون'); // كريم
    // Mona's is the outlier, and the object says so without accusing her.
    expect(timings).toContain('مفيش تفسير معلن');
  });

  it('states the timings and does not interpret them', () => {
    const all = textOf(EV2);
    for (const verdict of ['يبقى هي', 'مستنية الرسالة', 'سرّبت', 'المذنب', 'الفاعل']) {
      expect(all).not.toContain(verdict);
    }
  });

  it('authors the too-obvious-to-be-guilty counter-argument into a briefing', () => {
    // Risk 4 of the design: the counter-reading must exist somewhere a player
    // can actually say it. It is Karim's, and it is not in public content.
    const believes = KARIM.believes.join(' ');
    expect(believes).toContain('مبياخدش سكرين شوت لتسريبه هو بنفسه بعد ثانيتين');
    expect(believes).toContain('بتبرّيها مش بتدينها');
    expect(textOf(EV2)).not.toContain('بتبرّيها');
  });
});

/* ---------------------------------------------- C2 · the exact briefed lie */

describe('5 · EV-5 contradicts the exact sentence Mona was briefed to say', () => {
  it('gives Mona that sentence verbatim, in her own briefing', () => {
    expect(MONA.hiding.join(' ')).toContain('«الموبايل كان على الترابيزة.»');
  });

  it('shows the phone in her hand, and says it is not on the table', () => {
    const detail = EV5.fragments[1]!.lines.join(' ');
    expect(detail).toContain('منى عند طاولة الشاي، والموبايل في إيدها');
    expect(detail).toContain('مش على الترابيزة');
  });

  it('fires on the briefed line rather than on an improvised one', () => {
    // The whole of C2: the object's words and the briefing's words are about
    // the same object in the same place, so the contradiction does not depend
    // on the player having said anything they were not given.
    expect(MONA.hiding.join(' ')).toContain('الترابيزة');
    expect(EV5.fragments[1]!.lines.join(' ')).toContain('الترابيزة');
    // And her briefing names the bind rather than leaving her to find it.
    expect(MONA.hiding.join(' ')).toContain('أحسن رد على الثانيتين هو إنك كنتي ماسكة الموبايل');
  });

  it('does the C5 and C3 secondary jobs without becoming three objects', () => {
    const detail = EV5.fragments[1]!.lines.join(' ');
    expect(detail).toContain('كريم بره على البلكونة، بيتكلم في التليفون');
    expect(detail).toContain('تهاني مش ظاهرة في الصورة خالص');
    expect(detail).toContain('ياسر واقف عند الباب');
    expect(CASE_003.evidence).toHaveLength(3);
  });

  it('proves where she was, not what she did', () => {
    const all = textOf(EV5);
    for (const verdict of ['سرّبت', 'بعتت', 'كدبت', 'الفاعلة']) {
      expect(all).not.toContain(verdict);
    }
  });
});

/* ------------------------------------ C4/C6 · private information as weapons */

describe('6 · EV-3 and EV-4 are private holdings, not evidence objects', () => {
  it('keeps EV-3 in Yasser’s briefing and out of every public surface', () => {
    const line = 'لازم نتجوز الأول، بعدين نتصرف في موضوع الشغل بتاعه';
    expect(YASSER.knows.join(' ')).toContain(line);

    const publicText = JSON.stringify([CASE_003, CASE_003_EVIDENCE, CASE_003_TRUTH]);
    expect(publicText).not.toContain(line);
    // Nobody else holds it either — not even Tahani, whose message it is.
    for (const other of [MONA, TAHANI, KARIM]) {
      expect(JSON.stringify(other)).not.toContain(line);
    }
  });

  it('keeps EV-4 in Karim’s briefing and out of every public surface', () => {
    const draft = 'مسودة اتفاق شراكة';
    expect(KARIM.knows.join(' ')).toContain(draft);
    expect(KARIM.knows.join(' ')).toContain('تشتري الحصة دي بسعر واطي');

    const publicText = JSON.stringify([CASE_003, CASE_003_EVIDENCE, CASE_003_TRUTH]);
    expect(publicText).not.toContain(draft);
    for (const other of [MONA, TAHANI, YASSER]) {
      expect(JSON.stringify(other)).not.toContain(draft);
    }
  });

  it('gives Yasser the overheard argument, without the subject (C6)', () => {
    const knows = YASSER.knows.join(' ');
    expect(knows).toContain('سمعت منى وعمر بيتخانقوا');
    expect(knows).toContain('سمعت اسم سلمى');
    expect(knows).toContain('مسمعتش الخناقة كانت على إيه');
    // He does not know the reason, and he does not know she did it.
    expect(knows).not.toContain('عشان يقول لسلمى على الأزمة');
    expect(JSON.stringify(YASSER)).not.toContain('منى هي اللي سرّبت');
  });

  it('gives Karim’s interest a social discovery route, in two directions (C5)', () => {
    // He asked Yasser a question that reads oddly in hindsight…
    expect(KARIM.knows.join(' ')).toContain('سألت ياسر النهاردة');
    expect(YASSER.knows.join(' ')).toContain('كريم سألك النهاردة');
    // …and EV-5 puts him on a call at 9:47.
    expect(EV5.fragments[1]!.lines.join(' ')).toContain('بيتكلم في التليفون');
    // Neither route proves he leaked it.
    expect(JSON.stringify(CASE_003_TRUTH)).toContain('كريم مسرّبش الفويس');
  });

  it('needs no new evidence engine — the holdings are ordinary briefing text', () => {
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      expect(Object.keys(briefing).sort()).toEqual(
        ['believes', 'characterId', 'confrontation', 'goal', 'hiding', 'identity', 'knows'].sort(),
      );
    }
  });
});

/* ------------------------------------------------ the knowledge graph holds */

describe('7 · only Mona knows the answer', () => {
  it('states it in her briefing and in nobody else’s', () => {
    expect(MONA.knows.join(' ')).toContain('إنك إنتي اللي سرّبتي الفويس');
    for (const other of [TAHANI, YASSER, KARIM]) {
      const text = JSON.stringify(other);
      expect(text).not.toContain('منى سرّبت');
      expect(text).not.toContain('منى هي الفاعلة');
    }
  });

  it('gives the other three an honest denial each, worded differently', () => {
    expect(TAHANI.knows.join(' ')).toContain('مسرّبتيش الفويس');
    expect(YASSER.knows.join(' ')).toContain('مسرّبتش الفويس');
    expect(KARIM.knows.join(' ')).toContain('مسرّبتش الفويس');
  });

  it('gives Mona a motive only she can state in full', () => {
    expect(MONA.knows.join(' ')).toContain('اتخانقتي مع عمر');
    expect(MONA.hiding.join(' ')).toContain('سبب الخناقة');
    // Tahani noticed the tension but not the reason; Yasser heard it but not
    // the subject. Two partial routes, no second complete one.
    expect(TAHANI.knows.join(' ')).toContain('مش عارفة كان على إيه');
    expect(YASSER.knows.join(' ')).toContain('مسمعتش');
  });

  it('makes Tahani a genuine suspect rather than a bystander', () => {
    // Access, opportunity and a reason to close the question fast.
    expect(TAHANI.knows.join(' ')).toContain('أدمن في جروب العيلتين');
    expect(TAHANI.knows.join(' ')).toContain('بتسع ثواني');
    expect(TAHANI.knows.join(' ')).toContain('عرفتي بيها قبل الخطوبة بأسبوع');
    expect(TAHANI.goal).toContain('قبل ما السؤال يتحوّل');
  });
});

/* ------------------------------------------------------ confrontation round */

describe('8 · the confrontation round is content, not machinery', () => {
  it('gives every character an A and a B', () => {
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      expect(briefing.confrontation).toBeDefined();
      expect(briefing.confrontation!.optionA.length).toBeGreaterThan(0);
      expect(briefing.confrontation!.optionB.length).toBeGreaterThan(0);
      expect(briefing.confrontation!.intro).toContain('واحدة بس');
    }
  });

  it('never lets either option name the culprit', () => {
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      const both = `${briefing.confrontation!.optionA} ${briefing.confrontation!.optionB}`;
      for (const giveaway of ['منى سرّبت', 'منى هي اللي سرّبت', 'أنا اللي سرّبت', 'الفاعل']) {
        expect(both).not.toContain(giveaway);
      }
    }
  });

  it('gives both options a stated cost, so neither is free', () => {
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      for (const option of [briefing.confrontation!.optionA, briefing.confrontation!.optionB]) {
        // Every authored option is written as "what you say — what it costs
        // you", so the player is choosing between two prices rather than
        // between a good move and a bad one.
        expect(option).toContain('—');
        expect(option).toContain(' بس ');
      }
    }
  });

  it('adds no phase, no event and no state', () => {
    // The confrontation is a beat of the conversation. Nothing in the engine
    // knows it happened, and nothing about the game state changed to add it.
    expect(GAME_PHASES).not.toContain('CONFRONTATION');
    const keys = Object.keys(createInitialState());
    for (const field of ['confrontation', 'confrontationChoices', 'confrontationStep']) {
      expect(keys).not.toContain(field);
    }
  });

  it('announces the beat before the decision, without leaking anyone’s options', () => {
    expect(CASE_003.confrontationPrompt).toBeDefined();
    const html = render(atDecision());
    expect(html).toContain('آخر جولة قبل التصويت');
    expect(html).toContain('واحدة بس — مش الاتنين');

    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      expect(html).not.toContain(briefing.confrontation!.optionA);
      expect(html).not.toContain(briefing.confrontation!.optionB);
    }
  });

  it('leaves Cases 001 and 002 with no confrontation round at all', () => {
    expect(CASE_001.confrontationPrompt).toBeUndefined();
    expect(CASE_002.confrontationPrompt).toBeUndefined();
    for (const briefing of Object.values(CASE_002_BRIEFINGS)) {
      expect(briefing.confrontation).toBeUndefined();
    }
  });
});

/* ---------------------------------------------------- information boundary */

describe('9 · private briefings stay private', () => {
  it('keeps briefing text off the public case definition', () => {
    const serialised = JSON.stringify(CASE_003);
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      for (const line of briefingLines(briefing)) expect(serialised).not.toContain(line);
    }
  });

  it('keeps briefing text off the evidence, the prompts, the intro and the truth', () => {
    const publicText = JSON.stringify([
      CASE_003_EVIDENCE,
      CASE_003_TRUTH,
      CASE_003.intro,
      CASE_003.confrontationPrompt,
    ]);
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      for (const line of briefingLines(briefing)) expect(publicText).not.toContain(line);
    }
  });

  it('never puts one character’s briefing inside another’s', () => {
    for (const own of Object.values(CASE_003_BRIEFINGS)) {
      const others = Object.values(CASE_003_BRIEFINGS).filter((b) => b !== own);
      for (const other of others) {
        const otherText = JSON.stringify(other);
        for (const line of briefingLines(own)) {
          // The shared confrontation framing is the one deliberate overlap.
          if (line === own.confrontation?.intro) continue;
          expect(otherText).not.toContain(line);
        }
      }
    }
  });

  it('shows one player’s briefing and no one else’s on screen', () => {
    const opened = run(seatedGame(), { type: 'UNLOCK_BRIEFING' });
    // Fully open, one step before the pass screen.
    const readable = run(opened, ...Array(4).fill({ type: 'ADVANCE_BRIEFING_STEP' } as GameEvent));
    const shownId = readable.assignments[readable.players[0]!.id]!;
    const html = render(readable);

    expect(html).toContain(CASE_003_BRIEFINGS[shownId]!.goal);
    expect(html).toContain(CASE_003_BRIEFINGS[shownId]!.confrontation!.optionA);

    for (const [id, briefing] of Object.entries(CASE_003_BRIEFINGS)) {
      if (id === shownId) continue;
      expect(html).not.toContain(briefing.goal);
      for (const line of briefing.hiding) expect(html).not.toContain(line);
      expect(html).not.toContain(briefing.confrontation!.optionA);
      expect(html).not.toContain(briefing.confrontation!.optionB);
    }
  });

  it('shows nothing at all behind a closed gate', () => {
    const html = render(seatedGame());
    for (const briefing of Object.values(CASE_003_BRIEFINGS)) {
      for (const line of briefingLines(briefing)) expect(html).not.toContain(line);
    }
  });

  it('never puts a private holding on a shared screen', () => {
    const secrets = [
      'لازم نتجوز الأول، بعدين نتصرف في موضوع الشغل بتاعه',
      'مسودة اتفاق شراكة',
    ];
    for (const state of [atTable(), atDiscussion(), atDecision(), revealAfterVoting(ANSWER)]) {
      const html = render(state);
      for (const secret of secrets) expect(html).not.toContain(secret);
    }
  });
});

describe('10 · inspection detail only exists once the object is examined', () => {
  it('shows «اللي باين» before «اللي بيبان لما تدقّق»', () => {
    const sealed = run(atTable(), { type: 'OPEN_EVIDENCE' });
    const sealedHtml = render(sealed);
    expect(sealedHtml).toContain(EV1.title);
    for (const line of EV1.fragments.flatMap((f) => f.lines)) {
      expect(sealedHtml).not.toContain(line);
    }

    const firstTap = run(sealed, { type: 'INSPECT_EVIDENCE', evidenceId: 'ev-1' });
    const firstHtml = render(firstTap);
    for (const line of EV1.fragments[0]!.lines) expect(firstHtml).toContain(line);
    for (const later of EV1.fragments[1]!.lines) expect(firstHtml).not.toContain(later);

    const secondTap = run(firstTap, { type: 'INSPECT_EVIDENCE', evidenceId: 'ev-1' });
    expect(render(secondTap)).toContain('مبقاش باين أنهي أدمن');
  });

  it('never names an object the chain has not reached', () => {
    const html = render(atTable());
    for (const item of CASE_003.evidence) {
      expect(html).not.toContain(item.title);
      for (const line of item.fragments.flatMap((f) => f.lines)) expect(html).not.toContain(line);
    }
  });

  it('holds the photograph back until both earlier objects are placed', () => {
    let state = atTable();
    expect(render(state)).not.toContain('والموبايل في إيدها');

    state = run(placeNextEvidence(state), { type: 'DISCUSSION_COMPLETE' }); // EV-1
    expect(render(state)).not.toContain('والموبايل في إيدها');

    state = run(placeNextEvidence(state), { type: 'DISCUSSION_COMPLETE' }); // EV-2
    expect(activeEvidence(state).id).toBe('ev-5');
    expect(render(state)).not.toContain('والموبايل في إيدها');

    expect(render(placeNextEvidenceFragments(state))).toContain('والموبايل في إيدها');
  });
});

/* -------------------------------------------------------------- accusation */

describe('11 · the public accusation works, changes, and is not the vote', () => {
  it('starts with nobody named', () => {
    expect(seatedGame().accusation).toBeNull();
    expect(atDiscussion().accusation).toBeNull();
    expect(accusedCharacter(atDiscussion(), CASE_003)).toBeUndefined();
  });

  it('offers all four of this case’s characters, and refuses anyone else', () => {
    const table = atDiscussion();
    expect(accusableCharacters(table, CASE_003).map((c) => c.id).sort()).toEqual(
      ['karim', 'mona', 'tahani', 'yasser'].sort(),
    );
    // 'mostafa' is real in Case 002 and meaningless here.
    for (const bogus of ['mostafa', 'omar', 'nobody', '']) {
      expect(reduce(table, { type: 'SET_ACCUSATION', characterId: bogus }, ctx)).toBe(table);
    }
  });

  it('moves between all four as the argument turns', () => {
    let state = atDiscussion();
    for (const suspect of ['mona', 'tahani', 'karim', 'yasser'] as CharacterId[]) {
      state = run(state, { type: 'SET_ACCUSATION', characterId: suspect });
      expect(state.accusation).toBe(suspect);
    }
    // It never ends up forced onto Mona.
    expect(state.accusation).toBe('yasser');
  });

  it('shows the standing accusation on the shared screens, marked as not the vote', () => {
    const accused = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: 'tahani' });
    const html = render(accused);
    expect(html).toContain('The room is naming');
    expect(html).toContain('تهاني');
    expect(html).toContain('not voted');
  });

  it('belongs to the investigation only', () => {
    expect([...ACCUSATION_PHASES]).toEqual(['TABLE', 'EVIDENCE', 'DISCUSSION']);
    // Frozen once the room says it is ready.
    const decided = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: 'tahani' });
    const voting = run(playAllEvidence(decided), { type: 'START_VOTING' });
    expect(reduce(voting, { type: 'SET_ACCUSATION', characterId: 'mona' }, ctx)).toBe(voting);
    expect(voting.accusation).toBe('tahani');
    for (const phase of GAME_PHASES) {
      if (!isAccusationPhase(phase)) {
        expect(accusableCharacters({ ...voting, phase }, CASE_003)).toEqual([]);
      }
    }
  });

  it('leaves every vote field untouched, and does not pre-select the ballot', () => {
    const named = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: 'tahani' });
    expect(named.votes).toEqual({});

    const voting = run(playAllEvidence(named), { type: 'START_VOTING' });
    const html = render(run(voting, { type: 'UNLOCK_VOTE' }));
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain('ballot__option--selected');
  });

  it('is session-scoped: it persists, and a new session does not inherit it', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const named = run(atDiscussion(), { type: 'SET_ACCUSATION', characterId: 'karim' });

    persistence.save(named);
    expect(persistence.load()!.accusation).toBe('karim');
    expect(persistence.loadSession(named.sessionId!)!.accusation).toBe('karim');

    const home = reduce(named, { type: 'RESET' }, ctx);
    const fresh = reduce(home, { type: 'SELECT_CASE', caseId: CASE_003.id }, ctx);
    expect(fresh.sessionId).not.toBe(named.sessionId);
    expect(fresh.accusation).toBeNull();
  });

  it('puts the four names on the ballot, minus the voter’s own', () => {
    const opened = run(atVoting(), { type: 'UNLOCK_VOTE' });
    const options = ballotOptions(opened, CASE_003);
    const own = opened.assignments[opened.players[0]!.id];

    expect(options).toHaveLength(3);
    expect(options.map((c) => c.id)).not.toContain(own);
    for (const option of options) {
      expect(['mona', 'tahani', 'yasser', 'karim']).toContain(option.id);
    }
  });
});

/* -------------------------------------------------------------- divergence */

describe('12 · accusation, vote and truth are three separate facts', () => {
  it('accusation ≠ vote ≠ truth', () => {
    // The room argued Karim, voted Yasser, and Mona did it.
    const result = readOutVotes(playedRound('karim', 'yasser'));
    expect(new Set(['karim', 'yasser', ANSWER]).size).toBe(3);

    expect(accusedCharacter(result, CASE_003)?.id).toBe('karim');
    expect(chosenCharacter(result, CASE_003)?.id).toBe('yasser');
    expect(CASE_003_TRUTH.immediateAnswerCharacterId).toBe(ANSWER);

    const html = render(result);
    expect(html).toContain('contrast--diverged');
    expect(html).toContain('كريم');
    expect(html).toContain('ياسر');
    // A mismatch is a reading, not an error.
    expect(html.toLowerCase()).not.toContain('error');
  });

  it('accusation = vote ≠ truth — the room is wrong out loud and in private', () => {
    // The Tahani theory: complete, evidence-backed, and wrong.
    const result = readOutVotes(playedRound('tahani', 'tahani'));
    expect(accusedCharacter(result, CASE_003)?.id).toBe('tahani');
    expect(chosenCharacter(result, CASE_003)?.id).toBe('tahani');

    const html = render(result);
    expect(html).toContain('Accused');
    expect(html).toContain('Chosen');
    expect(html).not.toContain('contrast--diverged');

    const revealed = run(result, { type: 'SHOW_TRUTH' });
    expect(caseResult(revealed, CASE_003)).toBe('MISSED_IMMEDIATE_TRUTH');
    expect(render(revealed)).toContain('The room looked elsewhere.');
  });

  it('accusation = truth, vote ≠ truth — right out loud, wrong on the ballot', () => {
    const result = readOutVotes(playedRound('mona', 'tahani'));
    expect(accusedCharacter(result, CASE_003)?.id).toBe(ANSWER);
    expect(chosenCharacter(result, CASE_003)?.id).toBe('tahani');

    const revealed = run(result, { type: 'SHOW_TRUTH' });
    expect(caseResult(revealed, CASE_003)).toBe('MISSED_IMMEDIATE_TRUTH');
    const html = render(revealed);
    expect(html).toContain('سرّب الفويس');
    expect(html).not.toContain('took the letter');
  });

  it('accusation = vote = truth still reads as two separate acts', () => {
    const result = readOutVotes(playedRound('mona', 'mona'));
    const html = render(result);
    expect(html).toContain('Accused');
    expect(html).toContain('Chosen');
    expect(caseResult(run(result, { type: 'SHOW_TRUTH' }), CASE_003)).toBe(
      'FOUND_IMMEDIATE_TRUTH',
    );
  });

  it('a room that never named anyone still reaches the truth', () => {
    const round = playedRound(null, 'tahani');
    expect(round.accusation).toBeNull();
    const html = render(round);
    expect(html).toContain('The room named nobody');
    expect(html).not.toContain('undefined');
    expect(run(readOutVotes(round), { type: 'SHOW_TRUTH' }).phase).toBe('TRUTH_REVEAL');
  });

  it('keeps the tie and the single revote working', () => {
    const base = run(playAllEvidence(atDiscussion()), { type: 'START_VOTING' });
    const c = (seat: number) => characterOf(base, seat);
    const tied = voteAll(base, (seat) => (seat < 2 ? c(2) : c(0)));
    expect(voteOutcome(tied, CASE_003).kind).toBe('TIE');

    const revote = run(readOutVotes(tied), { type: 'START_REVOTE' });
    expect(revote.phase).toBe('VOTING');
    expect(revote.votes).toEqual({});
  });
});

/* ----------------------------------------------------------------- reveal */

describe('13 · the reveal shows accused, then voted, then truth', () => {
  it('opens on the accusation with not a single vote read out', () => {
    const round = playedRound('tahani', 'mona');
    expect(round.phase).toBe('VOTE_REVEAL');
    expect(round.voteRevealStep).toBe(0);

    const html = render(round);
    expect(html).toContain('The room accused');
    expect(html).toContain('تهاني');
    expect(html).toContain('That was the argument, not the ballot');
    expect(voteRevealLines(round, CASE_003)).toEqual([]);
    expect(html).not.toContain('tally__line');
    expect(html).not.toContain('The group chose');
    // منى got the votes, and her name is nowhere near this screen yet.
    expect(html).not.toContain('The group chose');
  });

  it('reads the votes out one at a time, never all at once', () => {
    const round = playedRound('tahani', 'mona');
    expect(Object.keys(round.votes)).toHaveLength(4);
    expect(voteRevealLines(run(round, { type: 'ADVANCE_VOTE_REVEAL' }), CASE_003)).toHaveLength(1);

    const html = render(readOutVotes(round));
    expect(html).toContain('The group chose');
    expect(html).toContain('Show the truth');
    for (const fact of orderedFacts(CASE_003_TRUTH)) {
      expect(html).not.toContain(fact.explanation);
    }
  });

  it('walks exactly seven truths, in the approved order, and closes the case', () => {
    let state = revealAfterVoting(ANSWER);
    const facts = orderedFacts(CASE_003_TRUTH);
    expect(facts).toHaveLength(7);

    for (let i = 0; i < facts.length; i += 1) {
      expect(state.revealStep).toBe(i);
      expect(currentTruthFact(state, CASE_003)?.id).toBe(facts[i]!.id);
      expect(revealProgress(state, CASE_003)).toMatchObject({ step: i + 1, total: 7 });
      state = run(state, { type: 'ADVANCE_REVEAL' });
    }
    expect(state.phase).toBe('CASE_COMPLETE');

    expect(facts.map((f) => f.id)).toEqual([
      'who-leaked',
      'not-revenge',
      'the-argument',
      'tahani-knew',
      'yasser-chose',
      'karim-counted',
      'who-decided-for-her',
    ]);
  });

  it('shows one truth at a time and never the ones after it', () => {
    const html = render(revealAfterVoting(ANSWER));
    const facts = orderedFacts(CASE_003_TRUTH);
    expect(html).toContain(facts[0]!.statement);
    for (const later of facts.slice(1)) expect(html).not.toContain(later.explanation);
  });
});

describe('14 · the seven-fact truth', () => {
  it('names منى as the immediate answer', () => {
    expect(CASE_003_TRUTH.immediateAnswerCharacterId).toBe(ANSWER);
    expect(immediateAnswerCharacter(CASE_003)?.name).toBe('منى');
    expect(CASE_003_TRUTH.immediateActionPhrase).toBe('سرّب الفويس');
  });

  it('gives every fact a unique id, a valid importance and a contiguous order', () => {
    const facts = orderedFacts(CASE_003_TRUTH);
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
    const immediate = CASE_003_TRUTH.facts.filter((f) => f.importance === 'immediate');
    expect(immediate).toHaveLength(1);
    expect(immediate[0]!.id).toBe(CASE_003_TRUTH.immediateFactId);
    expect(immediate[0]!.revealOrder).toBe(0);
    expect(immediate[0]!.question).toBe('مين سرّب الفويس؟');
    expect(immediate[0]!.statement).toContain('منى');
  });

  it('points only at evidence and characters that exist in this case', () => {
    const evidenceIds = CASE_003.evidence.map((e) => e.id);
    const characterIds = CASE_003.characters.map((c) => c.id);
    for (const fact of CASE_003_TRUTH.facts) {
      for (const id of fact.relatedEvidenceIds) expect(evidenceIds).toContain(id);
      for (const id of fact.relatedCharacterIds) expect(characterIds).toContain(id);
    }
    const referenced = new Set(CASE_003_TRUTH.facts.flatMap((f) => f.relatedEvidenceIds));
    expect([...referenced].sort()).toEqual([...evidenceIds].sort());
  });

  it('accounts for all four, and explains the three who did not do it', () => {
    const all = orderedFacts(CASE_003_TRUTH)
      .flatMap((f) => [f.question, f.statement, f.explanation])
      .join(' ');

    expect(all).toContain('منى سرّبته');
    expect(all).toContain('مش عشان تأذي عمر');
    expect(all).toContain('طلبت منه يقول لسلمى. رفض');
    expect(all).toContain('عرفت قبل الخطوبة بأسبوع وسكتت');
    expect(all).toContain('كان بيختار بين الحقيقة وعلاقته');
    expect(all).toContain('كان عارف إن الأزمة مؤقتة');
    expect(all).toContain('منى بس هي اللي قررت إنها تعرف');

    // It explains her; it does not excuse her, and it calls nobody a villain.
    for (const banned of ['مجرمة', 'خاينة', 'انتقام من عمر']) {
      expect(all).not.toContain(banned);
    }
  });

  it('leaves the seven truths identical however the room voted', () => {
    const found = walkReveal(revealAfterVoting(ANSWER));
    const missed = walkReveal(revealAfterVoting('tahani'));
    const other = walkReveal(revealAfterVoting('karim'));

    expect(found.seen).toHaveLength(7);
    expect(missed.seen).toEqual(found.seen);
    expect(other.seen).toEqual(found.seen);
    expect(found.end.phase).toBe('CASE_COMPLETE');
  });

  it('never grades the table at the ending', () => {
    for (const target of [ANSWER, 'tahani'] as CharacterId[]) {
      const html = render(walkReveal(revealAfterVoting(target)).end).toLowerCase();
      for (const banned of ['you win', 'you lose', 'was right', 'was wrong', 'correct', 'score']) {
        expect(html).not.toContain(banned);
      }
    }
  });
});

/* ----------------------------------------------------------------- replay */

describe('15 · different choices change the evening, not the truth', () => {
  it('reaches the same seven truths from four different accusations', () => {
    const authored = orderedFacts(CASE_003_TRUTH).map((f) => f.id);
    for (const accused of ['mona', 'tahani', 'yasser', 'karim', null] as Array<CharacterId | null>) {
      const revealed = run(readOutVotes(playedRound(accused, 'mona')), { type: 'SHOW_TRUTH' });
      expect(walkReveal(revealed).seen.map((f) => f.id)).toEqual(authored);
    }
  });

  it('reaches the same seven truths from four different vote winners', () => {
    const authored = orderedFacts(CASE_003_TRUTH).map((f) => f.id);
    for (const voted of ['mona', 'tahani', 'yasser', 'karim'] as CharacterId[]) {
      expect(walkReveal(revealAfterVoting(voted)).seen.map((f) => f.id)).toEqual(authored);
    }
  });

  it('never randomises the culprit', () => {
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      const state = [
        { type: 'SELECT_CASE', caseId: CASE_003.id },
        { type: 'INTRO_COMPLETE' },
        { type: 'SET_PLAYER_COUNT', count: 4 },
        { type: 'CONFIRM_PLAYERS' },
        { type: 'DEAL_CHARACTERS' },
      ].reduce(
        (s, e) => reduce(s, e as GameEvent, { ...ctx, random }),
        createInitialState(),
      );
      // Roles are dealt differently, and the answer never moves.
      expect(Object.keys(state.assignments)).toHaveLength(4);
      expect(getCase(state.caseId!)!.truth.immediateAnswerCharacterId).toBe(ANSWER);
    }
  });
});

/* ------------------------------------------------------------- regression */

describe('16 · Cases 001 and 002 are untouched', () => {
  it('leaves their casts, objects and truths exactly as they were', () => {
    expect(CASE_001.characters.map((c) => c.id)).toEqual(['maya', 'omar', 'youssef', 'samir']);
    expect(CASE_001.evidence.map((e) => e.id)).toEqual(['e01', 'e02', 'e03']);
    expect(CASE_001.truth.immediateAnswerCharacterId).toBe('omar');
    expect(CASE_001.decisionQuestion).toBeUndefined();

    expect(CASE_002.characters.map((c) => c.id)).toEqual(['souad', 'hoda', 'mostafa', 'nabil']);
    expect(CASE_002.evidence.map((e) => e.id)).toEqual(['e01', 'e02', 'e03', 'e04', 'e05']);
    expect(CASE_002.truth.immediateAnswerCharacterId).toBe('mostafa');
    expect(CASE_002.decisionQuestion).toBe('مين حرّك الظرف؟');

    for (const def of [CASE_001, CASE_002, CASE_003]) {
      expect(def.truth.facts).toHaveLength(7);
    }
  });

  it('keeps the three cases’ briefings in separate lookups', () => {
    expect(getPrivateBriefing(CASE_003.id, 'mostafa')).toBeUndefined();
    expect(getPrivateBriefing(CASE_003.id, 'omar')).toBeUndefined();
    expect(getPrivateBriefing(CASE_001.id, 'mona')).toBeUndefined();
    expect(getPrivateBriefing(CASE_002.id, 'mona')).toBeUndefined();
    expect(getPrivateBriefing(CASE_003.id, 'mona')?.identity).toContain('منى');
  });

  it('lists all three on the home screen, each under its own number', () => {
    const html = render(createInitialState());
    for (const def of CASES) expect(html).toContain(def.title);
    expect(render(run(createInitialState(), { type: 'SELECT_CASE', caseId: CASE_003.id }))).toContain(
      'Case 003',
    );
  });
});
