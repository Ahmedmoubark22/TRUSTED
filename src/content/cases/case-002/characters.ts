import type { CharacterDefinition } from '../../types';

/**
 * Case 002 — the four neighbours of the approved four-player cast.
 *
 * Public data only: id and name. Everything these people privately know lives
 * in `./briefings.ts` and never travels with the case definition.
 *
 * The full جمعية has six members; أم نادر and رمضان are absent tonight and are
 * named only inside the objects, never dealt. The four here are the four the
 * approved cast selection settled on, one decisive fact each.
 */
export const CASE_002_CHARACTERS: CharacterDefinition[] = [
  { id: 'souad', name: 'سعاد' },
  { id: 'hoda', name: 'هدى' },
  { id: 'mostafa', name: 'مصطفى' },
  { id: 'nabil', name: 'نبيل' },
];
