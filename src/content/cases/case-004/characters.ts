import type { CharacterDefinition } from '../../types';

/**
 * Case 004 — the five who were in the house.
 *
 * Public data only, exactly as in the earlier cases. Who did it is **not**
 * derivable from anything here: it lives in `src/content/culprits.ts`, behind
 * the same narrow lookup private briefings use, because this case is played
 * competitively and a player who can read the answer off their own screen has
 * not been beaten.
 *
 * Exactly five, and all five are dealt. The founder is named throughout and is
 * never a role — the same thing Case 003 does with عمر and سلمى.
 */
export const CASE_004_CHARACTERS: CharacterDefinition[] = [
  { id: 'wessam', name: 'وسام' },
  { id: 'nada', name: 'ندى' },
  { id: 'tarek', name: 'طارق' },
  { id: 'hala', name: 'هالة' },
  { id: 'essam', name: 'عصام' },
];
