import type { CharacterDefinition } from '../../types';

/**
 * Case 001 — the four characters of the vertical slice.
 *
 * Public data only: id and name. Everything these people privately know lives
 * in `./briefings.ts` and never travels with the case definition.
 */
export const CASE_001_CHARACTERS: CharacterDefinition[] = [
  { id: 'maya', name: 'Maya Rahman' },
  { id: 'omar', name: 'Omar Rahman' },
  { id: 'youssef', name: 'Youssef Adel' },
  { id: 'samir', name: 'Samir' },
];
