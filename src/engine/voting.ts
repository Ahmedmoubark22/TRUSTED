/**
 * The decision, as approved:
 *
 *   pass the phone → private vote → "Who do you trust least?" → one character
 *   → LOCK VOTE → pass the phone → … → the votes are read out
 *
 * `LOCKED` is the gate, and it works exactly like the briefing gate: while the
 * step is LOCKED the engine will not name the current voter's options, so a
 * device changing hands mid-round has nothing on it to leak.
 *
 * Votes target a *character*, not a player. The table argues about Omar, not
 * about whoever is holding seat two, and the reveal reads "MAYA → OMAR".
 *
 * Nothing here evaluates whether the table was right. The vote is what the
 * room believed; whether that is true belongs to the reveal step, which has
 * not been written yet. This module must stay ignorant of the culprit.
 */

import type { CharacterId } from '../content/types';

export const VOTE_STEPS = ['LOCKED', 'VOTING'] as const;

export type VoteStep = (typeof VOTE_STEPS)[number];

export function isVoteStep(value: unknown): value is VoteStep {
  return typeof value === 'string' && (VOTE_STEPS as readonly string[]).includes(value);
}

/** The approved question. One place, so it cannot drift between screens. */
export const DECISION_QUESTION = 'Who do you trust least?';

/**
 * One player's decision.
 *
 * `targetCharacterId` is null until the vote is locked in — an unsubmitted
 * choice has no target by construction, which is why a half-made decision can
 * never be read out of state. The selection a player is still hovering over
 * lives in the voting screen's local state and is never stored or persisted.
 */
export interface Vote {
  playerId: string;
  targetCharacterId: CharacterId | null;
  submitted: boolean;
}

export interface VoteCount {
  characterId: CharacterId;
  votes: number;
}

/**
 * Where a completed round of voting leaves the table.
 *
 * `DEADLOCK` is a tie that has already been through its one revote — the
 * approved outcome is that the group could not agree, not a tiebreaker.
 */
export type VoteOutcome =
  | { kind: 'PENDING' }
  | { kind: 'DECIDED'; characterId: CharacterId }
  | { kind: 'TIE'; characterIds: CharacterId[] }
  | { kind: 'DEADLOCK'; characterIds: CharacterId[] };

/** One entry per candidate, most votes first. Candidate order breaks ties. */
export function tallyVotes(
  votes: Readonly<Record<string, CharacterId>>,
  candidates: readonly CharacterId[],
): VoteCount[] {
  const counts = new Map<CharacterId, number>();
  for (const target of Object.values(votes)) {
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  return candidates
    .map((characterId) => ({ characterId, votes: counts.get(characterId) ?? 0 }))
    .sort((a, b) => b.votes - a.votes);
}

/** Everyone on the top count. More than one is a tie; none means nobody was named. */
export function leadingCharacters(tally: readonly VoteCount[]): CharacterId[] {
  const top = tally[0]?.votes ?? 0;
  if (top === 0) return [];
  return tally.filter((row) => row.votes === top).map((row) => row.characterId);
}

export function resolveVote(
  tally: readonly VoteCount[],
  options: { allVotesIn: boolean; hasRevoted: boolean },
): VoteOutcome {
  if (!options.allVotesIn) return { kind: 'PENDING' };
  const leaders = leadingCharacters(tally);
  const first = leaders[0];
  if (!first) return { kind: 'PENDING' };
  if (leaders.length === 1) return { kind: 'DECIDED', characterId: first };
  // One revote, then the group is allowed to have failed to agree.
  return options.hasRevoted
    ? { kind: 'DEADLOCK', characterIds: leaders }
    : { kind: 'TIE', characterIds: leaders };
}
