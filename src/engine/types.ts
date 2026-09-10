import type { CaseDefinition, CaseId, CharacterId, EvidenceId } from '../content/types';
import type { BriefingStep } from './briefing';
import type { GamePhase } from './phases';
import type { RoundOutcome } from './rounds';
import type { SessionId } from './session';
import type { VoteStep } from './voting';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Seat order around the table. Drives pass-and-play order. */
  seat: number;
}

/** Bumped whenever the persisted shape of GameState changes. */
export const SCHEMA_VERSION = 8;

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
  /**
   * Which play-through this state belongs to, or `null` at HOME where no game
   * is running.
   *
   * Minted when a case is opened and never reused. Everything below is *this
   * group's* progress through *this* case, which is why the whole record is
   * stored under this id rather than under one key per browser.
   */
  sessionId: SessionId | null;
  /**
   * True when a restored session must be handed back deliberately rather than
   * resumed on the spot.
   *
   * Set only by the loader, and only for a session interrupted somewhere the
   * app must not put a player straight back into — a private vote in progress.
   * The votes already locked in are untouched; this only decides whether the
   * table walks back in or is asked first.
   */
  recoveryRequired: boolean;
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
   * Who the table has been arguing is responsible, or `null` if it has not
   * settled on anyone.
   *
   * An accusation is not a vote and never becomes one. It is what the room
   * *says* during the investigation — revisable, non-binding, and held by the
   * group rather than by a seat. A table can spend the whole case accusing
   * سعاد and still name مصطفى on the ballot, and both of those facts matter.
   *
   * Kept deliberately bare: one character, no timestamp, no reason, no
   * history. Anything richer is a later decision, not this one.
   */
  accusation: CharacterId | null;
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
  /** Index into the case's authored truth facts during TRUTH_REVEAL. */
  revealStep: number;

  /* ------------------------------------------------- interrogation rounds */

  /**
   * The round being played, 1-based. `0` in a `reveal` case, which has none.
   */
  round: number;
  /**
   * How many rounds this case runs. Copied off the case when it is opened
   * rather than read back through `getCase` on every derivation — it is fixed
   * for the whole session, and holding it here keeps every round selector a
   * pure function of state.
   */
  totalRounds: number;
  /**
   * Who did it — resolved **once**, when roles are dealt, and held here.
   *
   * It would be shorter to read this out of content on demand. Holding it in
   * state instead is what makes the culprit a property of *this play-through*
   * rather than of the case, so a later change to deal it at random is a
   * content change and not an engine rewrite. That was the cheap decision to
   * take now, and this is it.
   *
   * Empty in a `reveal` case, which is also how every round selector knows to
   * stay out of the way.
   */
  culprits: CharacterId[];
  /** Named, and innocent. Out of the suspect pool; cannot be named again. */
  clearedCharacters: CharacterId[];
  /** Named, and guilty. */
  caughtCulprits: CharacterId[];
  /**
   * Who was struck off in the round now on screen, or `null`.
   *
   * The gate for the elimination card, and the reason it is a field rather
   * than something inferred from the tail of the two lists above: this is
   * *which card may be read right now*, and it is cleared the moment the
   * round advances. Like every other private-content gate in the engine it
   * holds an id, never the card.
   */
  lastEliminated: CharacterId | null;
  /**
   * How the case ended, or `null` while it is still running.
   *
   * Written by the reducer at the elimination, which is the one place the
   * engine compares a name against the answer.
   */
  outcome: RoundOutcome | null;
  /**
   * Every completed round's ballot, oldest first.
   *
   * `votes` is cleared between rounds so the next one starts empty; without
   * this the reveal of round three would have nothing to say about round one.
   */
  voteHistory: Record<PlayerId, CharacterId>[];
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
  /** A fresh session id. Injectable so session identity is fixed in tests. */
  newSessionId: () => SessionId;
  getCase: (caseId: CaseId) => CaseDefinition | undefined;
  /**
   * Who a case was authored guilty, or empty for a `reveal` case.
   *
   * Injected for the same reason `getCase` is — the engine stays content-
   * agnostic — and reached through a narrow lookup rather than off the case
   * definition, so the answer never travels on an object a view is handed.
   */
  getCulprits: (caseId: CaseId) => CharacterId[];
}
