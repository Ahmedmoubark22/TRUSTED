import type { CaseId, EvidenceId } from '../content/types';
import type { GamePhase } from './phases';
import type { PlayerId } from './types';

/**
 * Everything that can be asked of the engine. The UI dispatches these; it does
 * not mutate state directly and it does not choose the next phase itself.
 */
export type GameEvent =
  // Session
  | { type: 'RESET' }
  | { type: 'HYDRATE'; state: unknown }

  // HOME -> CASE_INTRO
  | { type: 'SELECT_CASE'; caseId: CaseId }
  | { type: 'BACK_TO_HOME' }

  // CASE_INTRO -> PLAYER_SETUP
  | { type: 'INTRO_COMPLETE' }

  // PLAYER_SETUP
  | { type: 'ADD_PLAYER'; name?: string }
  | { type: 'REMOVE_PLAYER'; playerId: PlayerId }
  | { type: 'RENAME_PLAYER'; playerId: PlayerId; name: string }
  | { type: 'SET_PLAYER_COUNT'; count: number }
  | { type: 'CONFIRM_PLAYERS' }

  // CHARACTER_ASSIGNMENT
  | { type: 'DEAL_CHARACTERS' }
  | { type: 'CONFIRM_ASSIGNMENTS' }

  // PRIVATE_BRIEFINGS
  /** The player at the device confirms they are alone with it. Opens the gate. */
  | { type: 'UNLOCK_BRIEFING' }
  /** Reveal the next section of the current player's briefing. */
  | { type: 'ADVANCE_BRIEFING_STEP' }
  /** Leave the pass screen and hand the device to the next player. */
  | { type: 'ADVANCE_BRIEFING' }

  // TABLE / EVIDENCE / DISCUSSION
  | { type: 'OPEN_EVIDENCE' }
  | { type: 'REVEAL_EVIDENCE'; evidenceId: EvidenceId }
  | { type: 'CLOSE_EVIDENCE' }
  | { type: 'OPEN_DISCUSSION' }
  | { type: 'CLOSE_DISCUSSION' }
  | { type: 'READY_TO_DECIDE' }
  | { type: 'RETURN_TO_TABLE' }

  // VOTING
  | { type: 'START_VOTING' }
  | { type: 'CAST_VOTE'; voterId: PlayerId; accusedId: PlayerId }

  // REVEAL
  | { type: 'SHOW_TRUTH' }
  | { type: 'ADVANCE_TRUTH_BEAT' }
  | { type: 'COMPLETE_CASE' }

  /**
   * Dev/test only. Bypasses the transition table so the phase walkthrough can
   * be driven quickly. The UI only exposes this behind the dev bar.
   */
  | { type: 'DEV_JUMP_TO_PHASE'; phase: GamePhase };

export type GameEventType = GameEvent['type'];
