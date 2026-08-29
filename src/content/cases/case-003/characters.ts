import type { CharacterDefinition } from '../../types';

/**
 * Case 003 — the four people still sitting at the engagement.
 *
 * Public data only: id and name. Everything these people privately know lives
 * in `./briefings.ts` and never travels with the case definition.
 *
 * Exactly four, as approved. عمر and سلمى are the engagement, not the cast —
 * they are named inside the objects and the intro, and are never dealt.
 */
export const CASE_003_CHARACTERS: CharacterDefinition[] = [
  { id: 'mona', name: 'منى' },
  { id: 'tahani', name: 'تهاني' },
  { id: 'yasser', name: 'ياسر' },
  { id: 'karim', name: 'كريم' },
];
