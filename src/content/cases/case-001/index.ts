/**
 * Case 001 — The Last Guest.
 *
 * ⚠ PLACEHOLDER CONTENT ⚠
 * This file exists so the shell has something structurally valid to render and
 * so the engine can be exercised end to end. Every string below is scaffolding,
 * not final writing. Characters, evidence, and truth beats are all replaced in
 * the Case 001 content step.
 *
 * Shape here is real. Words here are not.
 */
import type { CaseDefinition } from '../../types';

export const CASE_001: CaseDefinition = {
  id: 'case-001',
  title: 'The Last Guest',
  subtitle: 'A house that emptied one person too slowly.',
  intro: [
    'PLACEHOLDER — case intro paragraph one.',
    'PLACEHOLDER — case intro paragraph two.',
    'PLACEHOLDER — case intro paragraph three.',
  ],
  minPlayers: 3,
  maxPlayers: 6,
  estimatedMinutes: 45,

  characters: [
    {
      id: 'c1',
      name: 'The Host',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Host.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
    {
      id: 'c2',
      name: 'The Neighbour',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Neighbour.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
    {
      id: 'c3',
      name: 'The Executor',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Executor.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
    {
      id: 'c4',
      name: 'The Driver',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Driver.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
    {
      id: 'c5',
      name: 'The Archivist',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Archivist.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
    {
      id: 'c6',
      name: 'The Latecomer',
      publicRole: 'PLACEHOLDER — public role line.',
      privateBriefing: 'PLACEHOLDER — private briefing for The Latecomer.',
      privateObjectives: ['PLACEHOLDER objective A', 'PLACEHOLDER objective B'],
    },
  ],

  evidence: [
    {
      id: 'e1',
      title: 'PLACEHOLDER — Evidence One',
      teaser: 'PLACEHOLDER — locked teaser line.',
      body: 'PLACEHOLDER — revealed evidence body.',
      requires: [],
    },
    {
      id: 'e2',
      title: 'PLACEHOLDER — Evidence Two',
      teaser: 'PLACEHOLDER — locked teaser line.',
      body: 'PLACEHOLDER — revealed evidence body.',
      requires: [],
    },
    {
      id: 'e3',
      title: 'PLACEHOLDER — Evidence Three',
      teaser: 'PLACEHOLDER — locked teaser line.',
      body: 'PLACEHOLDER — revealed evidence body.',
      requires: ['e1'],
    },
    {
      id: 'e4',
      title: 'PLACEHOLDER — Evidence Four',
      teaser: 'PLACEHOLDER — locked teaser line.',
      body: 'PLACEHOLDER — revealed evidence body.',
      requires: ['e2'],
    },
  ],

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

  culpritCharacterId: 'c3',
  isPlaceholder: true,
};
