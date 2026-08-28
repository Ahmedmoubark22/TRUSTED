/**
 * Reading the vote against the authored truth.
 *
 * The direction of this dependency matters. Truth reads the vote outcome;
 * `voting.ts` knows nothing about truth and never will. That separation is
 * what stops the room's decision from quietly becoming the answer — the case
 * resolves the same way whoever was named.
 *
 * There is no scoring here, and nothing that grades the table. The result is
 * one of three descriptions of what the room found, and every one of them is
 * followed by the same seven truths.
 */

import type { CaseTruth, TruthFact } from '../content/types';
import type { VoteOutcome } from './voting';

/**
 * What the room's vote found.
 *
 * Only the *immediate* truth can be found by voting — the layers under it
 * were never on the ballot. `FOUND_IMMEDIATE_TRUTH` therefore means the room
 * got the one thing it was asked, not that it understood the case.
 */
export const TRUTH_RESULTS = [
  'FOUND_IMMEDIATE_TRUTH',
  'PARTIAL_TRUTH',
  'MISSED_IMMEDIATE_TRUTH',
] as const;

export type TruthResult = (typeof TRUTH_RESULTS)[number];

/**
 * `PARTIAL_TRUTH` is a room that named the right person without agreeing on
 * them — the answer was in the split, but the table never settled on it.
 */
export function interpretVote(outcome: VoteOutcome, truth: CaseTruth): TruthResult {
  const answer = truth.immediateAnswerCharacterId;
  switch (outcome.kind) {
    case 'DECIDED':
      return outcome.characterId === answer ? 'FOUND_IMMEDIATE_TRUTH' : 'MISSED_IMMEDIATE_TRUTH';
    case 'TIE':
    case 'DEADLOCK':
      return outcome.characterIds.includes(answer) ? 'PARTIAL_TRUTH' : 'MISSED_IMMEDIATE_TRUTH';
    case 'PENDING':
      // No completed vote to read. Nothing was found because nothing was said.
      return 'MISSED_IMMEDIATE_TRUTH';
  }
}

/** The facts in the order the case author set, regardless of array order. */
export function orderedFacts(truth: CaseTruth): TruthFact[] {
  return [...truth.facts].sort((a, b) => a.revealOrder - b.revealOrder);
}

export function factAt(truth: CaseTruth, step: number): TruthFact | undefined {
  return orderedFacts(truth)[step];
}

export function isFinalStep(truth: CaseTruth, step: number): boolean {
  return step >= truth.facts.length - 1;
}
