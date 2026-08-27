/**
 * Case 001 — The Last Guest.
 *
 * Four-player vertical slice. The characters, their private briefings and the
 * first three objects are approved prototype content (see `./characters.ts`,
 * `./briefings.ts` and `./evidence.ts`).
 *
 * What is left in this file — intro, truth beats, resolution — is still
 * PLACEHOLDER scaffolding, kept only so the later phases have something
 * structurally valid to render. It is replaced in the reveal step.
 */
import type { CaseDefinition } from '../../types';
import { CASE_001_CHARACTERS } from './characters';
import { CASE_001_EVIDENCE } from './evidence';

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

  truthBeats: [
    {
      id: 't1',
      title: 'PLACEHOLDER — What you were told',
      body: 'PLACEHOLDER — first layer of the reveal.',
    },
    {
      id: 't2',
      title: 'PLACEHOLDER — What actually happened',
      body: 'PLACEHOLDER — second layer of the reveal.',
    },
    {
      id: 't3',
      title: 'PLACEHOLDER — Why nobody said it',
      body: 'PLACEHOLDER — final layer of the reveal.',
    },
  ],

  // Deliberately unauthored. The case's resolution is not part of this step,
  // and guessing one would invent story that has not been approved.
  culpritCharacterId: null,
  isPlaceholder: true,
};
