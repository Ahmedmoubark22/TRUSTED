import type { CaseDefinition, CaseId, CharacterId, EvidenceId } from '../content/types';
import type { BriefingStep } from './briefing';
import type { GamePhase } from './phases';
import type { VoteStep } from './voting';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Seat order around the table. Drives pass-and-play order. */
  seat: number;
}

/** Bumped whenever the persisted shape of GameState changes. */
export const SCHEMA_VERSION = 4;

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
  /**
   * Evidence the table has put in front of itself, in the order it landed.
   * This list *is* the table. Anything not in it has not been reached, and
   * the app has no business naming it.
   */
  revealedEvidence: EvidenceId[];
  /**
   * How many fragments of the object currently in front of the table have
   * been uncovered. `0` means sealed. Which object that is comes from the
   * `requires` chain, so this never has to name one.
   */
  evidenceRevealed: number;
  /** Index into `players` for the pass-and-play voting handoff. */
  voteCursor: number;
  /** How far the player at the device has got. `LOCKED` means nothing is shown. */
  voteStep: VoteStep;
  /**
   * True when a private vote that was already open got restored from storage.
   * The gate uses it to explain itself instead of silently reopening.
   */
  voteResumed: boolean;
  /**
   * voterId -> the character they named. Only *locked* votes are here; a
   * selection still being considered never leaves the voting screen, so it is
   * neither stored nor persisted.
   */
  votes: Record<PlayerId, CharacterId>;
  /**
   * The tied characters a revote is being run between. Empty means this is
   * the first round — which is also what stops a second revote.
   */
  revoteCandidates: CharacterId[];
  /** How many votes have been read out during VOTE_REVEAL. */
  voteRevealStep: number;
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
