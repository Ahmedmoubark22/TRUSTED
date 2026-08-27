import type { CaseDefinition, CaseId, CharacterId, EvidenceId } from '../content/types';
import type { BriefingStep } from './briefing';
import type { GamePhase } from './phases';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Seat order around the table. Drives pass-and-play order. */
  seat: number;
}

/** Bumped whenever the persisted shape of GameState changes. */
export const SCHEMA_VERSION = 2;

/**
 * The one authoritative game state. Every view reads from this; no view keeps
 * its own copy of a gameplay fact.
 *
 * Note what is *not* here: no briefing text, no character secrets. State
 * records who is being briefed and how far they have read — never what they
 * read. That keeps private content out of anything that gets persisted,
 * serialised, or handed wholesale to a component.
 */
export interface GameState {
  schemaVersion: number;
  phase: GamePhase;
  caseId: CaseId | null;
  players: Player[];
  /** playerId -> characterId. Empty until roles are dealt. */
  assignments: Record<PlayerId, CharacterId>;
  /** Index into `players` for the pass-and-play briefing handoff. */
  briefingCursor: number;
  /** How far the current player has read. `LOCKED` means nothing is revealed. */
  briefingStep: BriefingStep;
  /**
   * True when a briefing that was already open got restored from storage.
   * The gate uses it to explain itself instead of silently reopening.
   */
  briefingResumed: boolean;
  /** Evidence unlocked by the table, in reveal order. */
  revealedEvidence: EvidenceId[];
  /** Index into `players` for the pass-and-play voting handoff. */
  voteCursor: number;
  /** voterId -> accused playerId. */
  votes: Record<PlayerId, PlayerId>;
  /** Index into the case's truth beats during TRUTH_REVEAL. */
  revealBeat: number;
  createdAt: number | null;
  updatedAt: number | null;
}

/**
 * Everything impure the reducer needs, injected so the reducer itself stays a
 * pure function of (state, event, ctx).
 */
export interface EngineContext {
  now: () => number;
  /** Uniform in [0, 1). Injectable so role dealing is deterministic in tests. */
  random: () => number;
  getCase: (caseId: CaseId) => CaseDefinition | undefined;
}
