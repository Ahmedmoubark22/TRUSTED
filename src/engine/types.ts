import type { CaseDefinition, CaseId, CharacterId, EvidenceId } from '../content/types';
import type { GamePhase } from './phases';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Seat order around the table. Drives pass-and-play order. */
  seat: number;
}

/** Bumped whenever the persisted shape of GameState changes. */
export const SCHEMA_VERSION = 1;

/**
 * The one authoritative game state. Every view reads from this; no view keeps
 * its own copy of a gameplay fact.
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
