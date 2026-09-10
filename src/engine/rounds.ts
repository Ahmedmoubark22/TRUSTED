/**
 * The round loop, as pure arithmetic.
 *
 * An `interrogation` case is played as: an object, questions, a private vote,
 * and one name struck off. This module owns what that name *means* — whether
 * the room has finished, and whether it won.
 *
 * Deliberately kept out of `voting.ts`. That module tallies and must stay
 * ignorant of the culprit; this one is allowed to know, and knows nothing
 * about how a ballot is collected. Both are pure, and neither touches state.
 */

import type { CharacterId } from '../content/types';

export const ROUND_OUTCOMES = ['RUNNING', 'ROOM_WON', 'CULPRITS_WON'] as const;

export type RoundOutcome = (typeof ROUND_OUTCOMES)[number];

export function isRoundOutcome(value: unknown): value is RoundOutcome {
  return typeof value === 'string' && (ROUND_OUTCOMES as readonly string[]).includes(value);
}

/**
 * How many elimination rounds a cast of this size plays by default.
 *
 * `suspects - 2` — which is not arbitrary. It is the value that lands the
 * three shapes the collection is being written for on comparable odds:
 * four players 50%, five 60%, six-with-two-culprits 40% (see
 * `randomRoomWinOdds`). A case may still author its own; this is what it
 * gets for free.
 */
export function defaultRounds(suspectCount: number): number {
  return Math.max(1, suspectCount - 2);
}

/**
 * The chance a room voting *at random* strikes every culprit within its
 * rounds — the floor a real table should beat.
 *
 * A room with `rounds` eliminations names `rounds` distinct suspects out of
 * `suspects`, so it wins exactly when every culprit lands in that draw:
 *
 *     C(suspects - culprits, rounds - culprits) / C(suspects, rounds)
 *
 * This is a *design* figure, not a gameplay one — nothing reads it at the
 * table. It exists so a case cannot quietly ship unwinnable or unlosable:
 * `tests/rounds.test.ts` holds every authored case inside a sane band.
 */
export function randomRoomWinOdds(
  suspects: number,
  culprits: number,
  rounds: number,
): number {
  if (culprits <= 0 || suspects <= 0) return 1;
  if (rounds < culprits || rounds > suspects) return rounds >= suspects ? 1 : 0;
  return choose(suspects - culprits, rounds - culprits) / choose(suspects, rounds);
}

function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 0; i < k; i += 1) result = (result * (n - i)) / (i + 1);
  return Math.round(result);
}

/** Who can still be named: everyone in play who has not already been struck off. */
export function remainingSuspects(
  active: readonly CharacterId[],
  cleared: readonly CharacterId[],
  caught: readonly CharacterId[],
): CharacterId[] {
  const gone = new Set([...cleared, ...caught]);
  return active.filter((id) => !gone.has(id));
}

/**
 * The last round, when everyone gets their vote back.
 *
 * A player whose character has been cleared sits out the rounds in between —
 * they have been answered for, and the room is deciding about people who have
 * not. The final round is the exception: it is the one that ends the case, so
 * the whole table votes on it, cleared or not.
 */
export function isFinalRound(round: number, totalRounds: number): boolean {
  return round >= totalRounds;
}

export interface EliminationInput {
  /** The character the room named. */
  named: CharacterId;
  /** Everyone this case was authored guilty. Never empty in this mode. */
  culprits: readonly CharacterId[];
  /** Culprits already struck off in earlier rounds. */
  caught: readonly CharacterId[];
  /** Innocents already struck off in earlier rounds. */
  cleared: readonly CharacterId[];
  /** Every character in play. */
  active: readonly CharacterId[];
  /** The round that just voted, 1-based. */
  round: number;
  /** How many rounds this case runs. */
  totalRounds: number;
}

export interface EliminationResult {
  /** True when the name was one of the culprits. */
  wasCulprit: boolean;
  caught: CharacterId[];
  cleared: CharacterId[];
  outcome: RoundOutcome;
}

/**
 * What the room just did to itself.
 *
 * Three ways this ends, and the third is the one that is easy to miss:
 *
 *   - every culprit struck off — the room won, whatever rounds are left;
 *   - the rounds run out with a culprit still standing — the culprits won;
 *   - the pool narrows until nobody is left in it but uncaught culprits.
 *     Naming anyone else has become impossible, so there is nothing left to
 *     hide behind and the room has them. A sensible `rounds` makes this
 *     unreachable; it is a floor, not a designed ending.
 */
export function resolveElimination(input: EliminationInput): EliminationResult {
  const { named, culprits, active, round, totalRounds } = input;
  const wasCulprit = culprits.includes(named);

  const caught = wasCulprit ? dedupe([...input.caught, named]) : [...input.caught];
  const cleared = wasCulprit ? [...input.cleared] : dedupe([...input.cleared, named]);

  if (culprits.every((id) => caught.includes(id))) {
    return { wasCulprit, caught, cleared, outcome: 'ROOM_WON' };
  }

  const remaining = remainingSuspects(active, cleared, caught);
  const uncaught = culprits.filter((id) => !caught.includes(id));
  if (remaining.length > 0 && remaining.every((id) => uncaught.includes(id))) {
    return { wasCulprit, caught, cleared, outcome: 'ROOM_WON' };
  }

  if (isFinalRound(round, totalRounds)) {
    return { wasCulprit, caught, cleared, outcome: 'CULPRITS_WON' };
  }

  return { wasCulprit, caught, cleared, outcome: 'RUNNING' };
}

function dedupe(ids: readonly CharacterId[]): CharacterId[] {
  return [...new Set(ids)];
}
