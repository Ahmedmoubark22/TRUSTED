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

/** A role a player can be dealt for a case. */
export interface CharacterDefinition {
  id: CharacterId;
  /** Public name shown at the table. */
  name: string;
  /** One line everyone can see. */
  publicRole: string;
  /**
   * Private briefing shown only to the player holding the device during
   * PRIVATE_BRIEFINGS. Authored content — not engine logic.
   */
  privateBriefing: string;
  /** Private objectives / pressure points for this character. */
  privateObjectives: string[];
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

/** The authored, self-contained definition of a playable case. */
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
  /** The character who is actually responsible. Revealed at the end. */
  culpritCharacterId: CharacterId;
  /** True once the case has been through the final content pass. */
  isPlaceholder: boolean;
}
