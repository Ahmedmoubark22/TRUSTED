/**
 * The public accusation, as approved:
 *
 *   evidence → suspicion → the room names somebody out loud → the others
 *   react → the room changes its mind → … → the private vote
 *
 * An accusation is what the table *says*. It is public by construction, held
 * by the group rather than by a seat, revisable as often as the argument
 * turns, and it is **not** the vote — a room can spend the whole case naming
 * one person and still put a different name on the ballot. Keeping the two
 * apart is what lets the reveal say "you accused X, you voted Y, it was Z".
 *
 * What is deliberately not modelled: *why*. The engine records the name the
 * room said, never the reasoning behind it. Reasons live in the argument,
 * where the players can lie about them.
 */

import type { GamePhase } from './phases';

/**
 * Where naming somebody is part of the game.
 *
 * The investigation, and only the investigation. Not the private briefing —
 * one player alone with a phone is not "the room". Not the decision or the
 * vote either: once the table says it is ready, the arguing is over and the
 * standing accusation is the one it carries into the ballot.
 */
export const ACCUSATION_PHASES = ['TABLE', 'EVIDENCE', 'DISCUSSION'] as const;

export type AccusationPhase = (typeof ACCUSATION_PHASES)[number];

export function isAccusationPhase(phase: GamePhase): phase is AccusationPhase {
  return (ACCUSATION_PHASES as readonly string[]).includes(phase);
}
