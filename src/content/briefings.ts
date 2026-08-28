import type { CaseId, CharacterId, PrivateBriefing } from './types';
import { CASE_001 } from './cases/case-001';
import { CASE_001_BRIEFINGS } from './cases/case-001/briefings';
import { CASE_002 } from './cases/case-002';
import { CASE_002_BRIEFINGS } from './cases/case-002/briefings';

/**
 * The only way to reach a character's private knowledge.
 *
 * Private briefings are kept out of `CaseDefinition` on purpose. A case
 * definition is handed to every view — putting secrets on it would make every
 * secret one property access away from being rendered. Instead the lookup is
 * narrow: one case, one character, one briefing.
 *
 * Callers are expected to ask the engine *whose* briefing may be shown before
 * calling this. See `revealableCharacterId` in the engine, and
 * `useCurrentBriefing`, which is the single bridge between the two.
 */
const BRIEFINGS_BY_CASE: Record<CaseId, Record<CharacterId, PrivateBriefing>> = {
  [CASE_001.id]: CASE_001_BRIEFINGS,
  [CASE_002.id]: CASE_002_BRIEFINGS,
};

export function getPrivateBriefing(
  caseId: CaseId | null | undefined,
  characterId: CharacterId | null | undefined,
): PrivateBriefing | undefined {
  if (!caseId || !characterId) return undefined;
  return BRIEFINGS_BY_CASE[caseId]?.[characterId];
}

/** Every character in a case that has an authored briefing. Content checks only. */
export function briefedCharacterIds(caseId: CaseId): CharacterId[] {
  return Object.keys(BRIEFINGS_BY_CASE[caseId] ?? {});
}
