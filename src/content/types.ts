/**
 * Content layer — "Content defines what is true."
 *
 * These types describe an authored case. Nothing here knows about React or
 * about the engine's phase machine; the engine consumes case definitions
 * through `EngineContext.getCase`, and the UI renders them.
 */

export type CaseId = string;
export type CharacterId = string;
export type EvidenceId = string;
export type TruthFactId = string;

/**
 * How a case is played.
 *
 * `reveal` is the original shape and stays the default: one investigation,
 * one vote, a layered truth nobody was competing over. Cases 001–003 are
 * authored for it and are not affected by anything the other mode adds.
 *
 * `interrogation` is competitive. Rounds of evidence, questioning, a private
 * vote and an elimination; one or more culprits who know they are culprits
 * and win by lasting. The mode lives on the case rather than in a setting
 * because it is a property of the writing, not of the table.
 */
export const CASE_MODES = ['reveal', 'interrogation'] as const;

export type CaseMode = (typeof CASE_MODES)[number];

/**
 * Who these people are to each other. Catalogue metadata — it groups the
 * home screen and nothing else reads it.
 */
export const CAST_KINDS = ['family', 'neighbours', 'friends', 'colleagues', 'strangers'] as const;

export type CastKind = (typeof CAST_KINDS)[number];

/**
 * Who the case is written for. A room of women, a room of men, or a mixed
 * table — the writing differs, so the catalogue says so up front rather than
 * letting a group find out at the briefing.
 */
export const CAST_GENDERS = ['women', 'men', 'mixed'] as const;

export type CastGender = (typeof CAST_GENDERS)[number];

/**
 * A role a player can be dealt.
 *
 * Public by design. A `CaseDefinition` is handed to every view, so anything
 * on this type is effectively visible to the whole table — which is why a
 * character's private knowledge is deliberately NOT here. See
 * `PrivateBriefing` and `src/content/briefings.ts`.
 */
export interface CharacterDefinition {
  id: CharacterId;
  /** Public name. Safe to show at the table. */
  name: string;
}

/**
 * What exactly one character privately knows.
 *
 * This never travels with the case definition and never enters game state.
 * It is reachable only through `getPrivateBriefing`, and only for the
 * character the engine says may currently be revealed.
 */
export interface PrivateBriefing {
  characterId: CharacterId;
  /** "You are…" — how the character is introduced to their own player. */
  identity: string;
  /** "You know…" */
  knows: string[];
  /** "You believe…" */
  believes: string[];
  /** "You are hiding…" */
  hiding: string[];
  /** "Your goal…" */
  goal: string;
  /**
   * The two things this character may say in the confrontation round, if the
   * case runs one. Omitted means the case has no such round.
   *
   * Private, like the rest of this record, and read once — at briefing time,
   * by the one player it belongs to. The confrontation itself is a beat of the
   * conversation rather than a phase: the app announces it (see
   * `CaseDefinition.confrontationPrompt`) and the player picks from what they
   * were given here. No event, no state, nothing to persist.
   */
  confrontation?: BriefingConfrontation;
  /**
   * The one thing this character gives up to the whole room when they are
   * cleared, in an `interrogation` case.
   *
   * This is what stops a wrong vote from being a wasted round: naming the
   * wrong person still costs them a secret, so the case moves forward on
   * every elimination rather than only on the right one. Written to be read
   * out loud, and written to be worth hearing.
   *
   * It lives here, in the private record, because until it is spent it is
   * exactly as private as the rest of the briefing. The engine names *who*
   * has been cleared; it never carries what their card said.
   */
  onEliminated?: string;
}

/**
 * One character's A/B choice for the confrontation round.
 *
 * A protects the speaker; B puts pressure on somebody else. Both are authored
 * to cost something, and neither may name the culprit — a case that resolves
 * itself in this round has replaced its own vote.
 */
export interface BriefingConfrontation {
  /** How the choice is framed to this player. */
  intro: string;
  /** A — protects or stabilises the speaker. */
  optionA: string;
  /** B — creates pressure on somebody else. */
  optionB: string;
}

/**
 * What kind of object a piece of evidence physically is.
 *
 * This is the only thing that drives how evidence is presented. There is one
 * evidence viewer, not one screen per object — a new type is a new stylesheet
 * rule and a new affordance label, never a new component.
 */
export const EVIDENCE_TYPES = [
  // Case 001
  'invitation',
  'photograph',
  'letter',
  // Case 002 — five more objects, each a stylesheet rule and an affordance
  // label under the same single viewer. No new components.
  'notebook',
  'list',
  'receipt',
  'phoneScreen',
  'envelope',
  // Case 004 — a printed institutional page. One more stylesheet rule under
  // the same single viewer, exactly like the five above.
  'form',
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/**
 * One uncovering of an object.
 *
 * Objects are not read all at once. A card gets turned over; a letter is read
 * down the page. Each fragment is one tap, so the table sees the object the
 * way a hand would actually work through it.
 */
export interface EvidenceFragment {
  /** Where on the object this is — "The back of the card", "Lower down". */
  caption: string;
  lines: string[];
}

/**
 * A piece of evidence the table can uncover and place in front of everyone.
 *
 * Public by design, exactly like `CharacterDefinition`. Evidence is what the
 * whole room is allowed to know; anything only one player knows belongs in
 * `PrivateBriefing` and must not be written here.
 */
export interface EvidenceDefinition {
  id: EvidenceId;
  type: EvidenceType;
  title: string;
  /** How the object presents itself before it is opened. No contents. */
  description: string;
  /** The object's contents, uncovered one fragment at a time. */
  fragments: EvidenceFragment[];
  /** Optional asset under /public/assets. Absent means the CSS placeholder. */
  imageSrc?: string;
  /**
   * Evidence that must already be on the table before this becomes available.
   * Empty means "available from the start". This chain *is* the authored
   * progression — the engine reads the order from here, not from a hard-coded
   * list somewhere in the app.
   */
  requires: EvidenceId[];
  /** The question left hanging once this is on the table. */
  discussionPrompt?: string;
  /**
   * Who this object throws suspicion on, in an `interrogation` case.
   *
   * The rule the mode turns on: **at least two**. Evidence that names one
   * person answers the case instead of feeding it, and a round with a settled
   * answer has nothing left to interrogate. `tests/content.test.ts` enforces
   * the floor rather than trusting the author to remember it.
   *
   * This is a *design* record, not a gameplay one. Nothing renders it and no
   * screen reads it — it exists so the fairness audit can be run by a test
   * instead of by hand.
   */
  implicates?: CharacterId[];
}

/**
 * How much weight a fact carries.
 *
 * `immediate` is the thing the table was actually asked to work out, so it is
 * the only one the group's vote can be measured against. `core` and `deeper`
 * are the layers underneath it — the parts a correct vote still does not buy
 * you, which is the whole point of the reveal.
 */
export const TRUTH_IMPORTANCE = ['immediate', 'core', 'deeper'] as const;

export type TruthImportance = (typeof TRUTH_IMPORTANCE)[number];

/**
 * One authored truth, and one step of the reveal.
 *
 * Content states what is true; the engine only decides which one is on screen.
 * Nothing here is computed from how the table voted — a case reveals the same
 * truth whoever it accused.
 */
export interface TruthFact {
  id: TruthFactId;
  /** What the step opens by asking. */
  question: string;
  /** The answer, said plainly. This is the line that carries the screen. */
  statement: string;
  importance: TruthImportance;
  /** Objects on the table that pointed at this. May be empty. */
  relatedEvidenceIds: EvidenceId[];
  /** Whose truth this is. May be empty. */
  relatedCharacterIds: CharacterId[];
  /** Position in the reveal. Ascending, contiguous from 0. */
  revealOrder: number;
  /** The context behind the statement. */
  explanation: string;
}

/** A case's authored resolution. */
export interface CaseTruth {
  /**
   * The character at the centre of the immediate truth — here, whoever took
   * the letter. The reveal compares the group's vote against this to describe
   * what they found. Naming them is not a verdict, and this case's answer is
   * deliberately not a villain.
   */
  immediateAnswerCharacterId: CharacterId;
  /** The fact that names them. Must be the `immediate` one. */
  immediateFactId: TruthFactId;
  /**
   * How the immediate question reads as a clause — "took the letter",
   * "حرّك الظرف".
   *
   * The shared reveal and ending screens have one sentence each that has to
   * name what the room was actually asked to work out. Without this they can
   * only do it by hard-coding one case's fiction into a view every case uses.
   * Omitted falls back to a neutral phrasing.
   */
  immediateActionPhrase?: string;
  /** Every layer, in reveal order. */
  facts: TruthFact[];
}

/** The authored, public definition of a playable case. */
export interface CaseDefinition {
  id: CaseId;
  title: string;
  subtitle: string;
  /**
   * How this case is played. Omitted means `reveal`, which is what keeps
   * Cases 001–003 working untouched while the other mode exists.
   */
  mode?: CaseMode;
  /**
   * How many elimination rounds an `interrogation` case runs. Ignored by
   * `reveal` cases.
   *
   * This is the difficulty dial, and it is authored rather than derived
   * because it is the only number that moves the odds. A room voting at
   * random catches every culprit with probability `C(rounds, culprits) /
   * C(suspects, culprits)` — see `randomRoomWinOdds` in
   * `src/engine/rounds.ts`, which a test holds inside a sane band so a case
   * cannot ship unwinnable or unlosable.
   */
  rounds?: number;
  /** Catalogue metadata. Groups the home screen; no gameplay meaning. */
  castKind?: CastKind;
  castGender?: CastGender;
  /** Text shown during CASE_INTRO. */
  intro: string[];
  minPlayers: number;
  maxPlayers: number;
  /** Estimated play time, minutes. Display only. */
  estimatedMinutes: number;
  characters: CharacterDefinition[];
  evidence: EvidenceDefinition[];
  /**
   * The question the table answers at the decision, if this case asks its own.
   *
   * Votes still target a character and are still read against
   * `truth.immediateAnswerCharacterId` — only the wording of the question
   * changes. Omitted means the product's default question, which is what
   * Case 001 uses.
   */
  decisionQuestion?: string;
  /**
   * The one line the app says before the decision, if this case runs a
   * confrontation round.
   *
   * Structural facilitation and nothing else: it announces the beat and states
   * the rule — one choice each, not both. What each player may actually say is
   * private, and stays in their own briefing. Omitted means no such round,
   * which is what Cases 001 and 002 do.
   */
  confrontationPrompt?: string;
  /** The authored resolution, played out during TRUTH_REVEAL. */
  truth: CaseTruth;
  /** True while any part of the case is still scaffolding. */
  isPlaceholder: boolean;
}
