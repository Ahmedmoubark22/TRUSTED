/**
 * The catalogue of authored cases. The engine never imports this file — it
 * receives case lookups through `EngineContext`, so the engine stays
 * content-agnostic and easy to test.
 */
import type { CaseDefinition, CaseId } from './types';
import { CASE_001 } from './cases/case-001';

export const CASES: readonly CaseDefinition[] = [CASE_001];

export const DEFAULT_CASE_ID: CaseId = CASE_001.id;

export function getCase(caseId: CaseId | null | undefined): CaseDefinition | undefined {
  if (!caseId) return undefined;
  return CASES.find((c) => c.id === caseId);
}
