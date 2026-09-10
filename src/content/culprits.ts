import type { CaseId, CharacterId } from './types';

/**
 * Who actually did it, in an `interrogation` case.
 *
 * This is deliberately **not** on `CaseDefinition`. A case definition is handed
 * to every view, so anything on it is effectively public — which is fine for a
 * `reveal` case, where the answer is the payload and nobody is competing over
 * it, but wrong for a competitive one. A player who can read the culprit off
 * the object their own screen was given has not been beaten, they have been
 * handed the answer.
 *
 * So culprits live here, behind the same narrow lookup private briefings use:
 * one case, one array, and no way to enumerate cases you were not asking about.
 * `reveal` cases are absent from this map on purpose — their answer is
 * `truth.immediateAnswerCharacterId` and always was.
 *
 * This is not a security boundary and does not pretend to be one. Authored
 * content ships in the bundle, and a determined player with devtools can read
 * anything the app can. What it does is make the answer *unreachable by
 * accident* — no view can render it, no component can be handed it, and no
 * careless prop spread can leak it. That is the same standard the rest of the
 * private-information design holds itself to.
 */
const CULPRITS_BY_CASE: Record<CaseId, readonly CharacterId[]> = {
  // Case 004 — one culprit, fixed. Fixed is a decision, not a limitation of
  // the engine: the culprits are resolved once when roles are dealt and held
  // in state from there, so authoring three possible culprits and picking one
  // at the deal is a change to this file and nothing else.
  'case-004': ['essam'],

  // Case 005 — one culprit: hassan, who takes family money to cover debt.
  'case-005': ['hassan'],
};

/**
 * The culprits a case was authored with, or empty for a `reveal` case.
 *
 * Empty is a meaningful answer, not a missing one: it is what every case in
 * the original mode returns, and the engine reads it as "this case is not
 * played in rounds".
 */
export function getCulprits(caseId: CaseId | null | undefined): CharacterId[] {
  if (!caseId) return [];
  return [...(CULPRITS_BY_CASE[caseId] ?? [])];
}
