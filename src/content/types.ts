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
export type TruthBeatId = string;

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
}

/** A piece of evidence the table can reveal during the investigation. */
export interface EvidenceDefinition {
  id: EvidenceId;
  title: string;
  /** Short line shown on the locked card. */
  teaser: string;
  /** Full text shown once revealed. */
  body: string;
  /** Optional asset under /public/assets. */
  imageSrc?: string;
  /**
   * Evidence that must already be revealed before this becomes available.
   * Empty means "available from the start".
   */
  requires: EvidenceId[];
}

/** One step of the layered truth reveal. */
export interface TruthBeatDefinition {
  id: TruthBeatId;
  title: string;
  body: string;
}

/** The authored, public definition of a playable case. */
export interface CaseDefinition {
  id: CaseId;
  title: string;
  subtitle: string;
  /** Text shown during CASE_INTRO. */
  intro: string[];
  minPlayers: number;
  maxPlayers: number;
  /** Estimated play time, minutes. Display only. */
  estimatedMinutes: number;
  characters: CharacterDefinition[];
  evidence: EvidenceDefinition[];
  /** Ordered beats played out during TRUTH_REVEAL. */
  truthBeats: TruthBeatDefinition[];
  /**
   * The character who is actually responsible. `null` while the case's
   * resolution has not been authored yet — the reveal step will set this.
   */
  culpritCharacterId: CharacterId | null;
  /** True while any part of the case is still scaffolding. */
  isPlaceholder: boolean;
}
