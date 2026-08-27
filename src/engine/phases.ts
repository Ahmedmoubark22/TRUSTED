/**
 * The approved phase set and the legal moves between phases.
 *
 * This table is the single answer to "what can happen next". Views never
 * decide their own successor — they dispatch an event and the reducer asks
 * this table whether the move is allowed.
 */

export const GAME_PHASES = [
  'HOME',
  'CASE_INTRO',
  'PLAYER_SETUP',
  'CHARACTER_ASSIGNMENT',
  'PRIVATE_BRIEFINGS',
  'TABLE',
  'EVIDENCE',
  'DISCUSSION',
  'DECISION_READY',
  'VOTING',
  'VOTE_REVEAL',
  'TRUTH_REVEAL',
  'CASE_COMPLETE',
] as const;

export type GamePhase = (typeof GAME_PHASES)[number];

export interface PhaseMeta {
  /** Shown in the app shell header. */
  title: string;
  /** Short orientation line. */
  hint: string;
  /**
   * True when the phase shows private information and the device is meant to
   * be held by exactly one player.
   */
  isPrivate: boolean;
}

export const PHASE_META: Record<GamePhase, PhaseMeta> = {
  HOME: { title: 'TRUSTED', hint: 'Everyone knows something.', isPrivate: false },
  CASE_INTRO: { title: 'The Case', hint: 'Read this aloud.', isPrivate: false },
  PLAYER_SETUP: { title: 'Players', hint: 'Who is at the table?', isPrivate: false },
  CHARACTER_ASSIGNMENT: { title: 'Roles', hint: 'Roles are being dealt.', isPrivate: false },
  PRIVATE_BRIEFINGS: { title: 'Briefing', hint: 'Pass the device. One player only.', isPrivate: true },
  TABLE: { title: 'The Table', hint: 'Investigate together.', isPrivate: false },
  EVIDENCE: { title: 'Evidence', hint: 'What the room can prove.', isPrivate: false },
  DISCUSSION: { title: 'Discussion', hint: 'Talk. Out loud. To each other.', isPrivate: false },
  DECISION_READY: { title: 'Ready?', hint: 'The vote cannot be undone.', isPrivate: false },
  VOTING: { title: 'Vote', hint: 'Pass the device. Vote in private.', isPrivate: true },
  VOTE_REVEAL: { title: 'The Vote', hint: 'What the table decided.', isPrivate: false },
  TRUTH_REVEAL: { title: 'The Truth', hint: 'What actually happened.', isPrivate: false },
  CASE_COMPLETE: { title: 'Case Closed', hint: 'Everyone knew something.', isPrivate: false },
};

/**
 * Legal successor phases. A move not listed here is rejected by the reducer.
 */
export const PHASE_TRANSITIONS: Record<GamePhase, readonly GamePhase[]> = {
  HOME: ['CASE_INTRO'],
  CASE_INTRO: ['PLAYER_SETUP', 'HOME'],
  PLAYER_SETUP: ['CHARACTER_ASSIGNMENT', 'CASE_INTRO'],
  CHARACTER_ASSIGNMENT: ['PRIVATE_BRIEFINGS', 'PLAYER_SETUP'],
  PRIVATE_BRIEFINGS: ['TABLE'],
  TABLE: ['EVIDENCE', 'DISCUSSION', 'DECISION_READY'],
  EVIDENCE: ['TABLE'],
  DISCUSSION: ['TABLE', 'DECISION_READY'],
  DECISION_READY: ['VOTING', 'TABLE'],
  VOTING: ['VOTE_REVEAL'],
  VOTE_REVEAL: ['TRUTH_REVEAL'],
  TRUTH_REVEAL: ['CASE_COMPLETE'],
  CASE_COMPLETE: ['HOME'],
};

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  return PHASE_TRANSITIONS[from].includes(to);
}

/**
 * A single straight line through every phase. Used by the dev phase stepper
 * and by the traversal test; it is not the rule the reducer enforces.
 */
export const PHASE_WALKTHROUGH: readonly GamePhase[] = GAME_PHASES;

export function isPhase(value: unknown): value is GamePhase {
  return typeof value === 'string' && (GAME_PHASES as readonly string[]).includes(value);
}
