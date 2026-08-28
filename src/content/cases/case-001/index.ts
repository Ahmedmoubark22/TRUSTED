/**
 * Case 001 — The Last Guest.
 *
 * Four-player vertical slice. The characters, their private briefings and the
 * first three objects are approved prototype content (see `./characters.ts`,
 * `./briefings.ts` and `./evidence.ts`).
 *
 * The resolution is authored in `./truth.ts`. What is left as PLACEHOLDER in
 * this file is the case intro, which belongs to a later content pass.
 */
import type { CaseDefinition } from '../../types';
import { CASE_001_CHARACTERS } from './characters';
import { CASE_001_EVIDENCE } from './evidence';
import { CASE_001_TRUTH } from './truth';

export const CASE_001: CaseDefinition = {
  id: 'case-001',
  title: 'The Last Guest',
  subtitle: 'A house that emptied one person too slowly.',
  intro: [
    'PLACEHOLDER — case intro paragraph one.',
    'PLACEHOLDER — case intro paragraph two.',
    'PLACEHOLDER — case intro paragraph three.',
  ],

  // The slice is authored for exactly four players: four characters, four
  // briefings. The 3–6 player range returns when the full cast is written.
  minPlayers: 4,
  maxPlayers: 4,
  estimatedMinutes: 45,

  characters: CASE_001_CHARACTERS,

  evidence: CASE_001_EVIDENCE,

  truth: CASE_001_TRUTH,

  // Still true: the case intro is scaffolding. Everything else is authored.
  isPlaceholder: true,
};
