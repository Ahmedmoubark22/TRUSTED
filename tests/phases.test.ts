import { describe, expect, it } from 'vitest';
import {
  GAME_PHASES,
  PHASE_META,
  PHASE_TRANSITIONS,
  canTransition,
  isPhase,
} from '../src/engine/phases';

describe('approved phase set', () => {
  const APPROVED = [
    'HOME',
    'CASE_INTRO',
    'PLAYER_SETUP',
    'CHARACTER_ASSIGNMENT',
    'PRIVATE_BRIEFINGS',
    'TABLE',
    'EVIDENCE',
    'DISCUSSION',
    'DECISION_READY',
    'VOTING',
    'VOTE_REVEAL',
    'TRUTH_REVEAL',
    'CASE_COMPLETE',
  ];

  it('contains exactly the approved phases, in order', () => {
    expect([...GAME_PHASES]).toEqual(APPROVED);
  });

  it('has metadata and a transition entry for every phase', () => {
    for (const phase of GAME_PHASES) {
      expect(PHASE_META[phase]).toBeDefined();
      expect(PHASE_TRANSITIONS[phase]).toBeDefined();
    }
  });

  it('only ever points at real phases', () => {
    for (const targets of Object.values(PHASE_TRANSITIONS)) {
      for (const target of targets) expect(isPhase(target)).toBe(true);
    }
  });

  it('leaves every phase reachable from HOME', () => {
    const seen = new Set(['HOME']);
    const queue = ['HOME'] as const satisfies readonly string[];
    const work: string[] = [...queue];
    while (work.length) {
      const current = work.pop();
      if (!current || !isPhase(current)) continue;
      for (const next of PHASE_TRANSITIONS[current]) {
        if (!seen.has(next)) {
          seen.add(next);
          work.push(next);
        }
      }
    }
    expect(seen.size).toBe(GAME_PHASES.length);
  });

  it('rejects moves that are not in the table', () => {
    expect(canTransition('HOME', 'CASE_INTRO')).toBe(true);
    expect(canTransition('HOME', 'VOTING')).toBe(false);
    expect(canTransition('PRIVATE_BRIEFINGS', 'VOTE_REVEAL')).toBe(false);
    expect(canTransition('TRUTH_REVEAL', 'HOME')).toBe(false);
  });
});
