import { describe, expect, it } from 'vitest';
import { CASE_001 } from '../src/content/cases/case-001';
import { getCase } from '../src/content/registry';
import { GAME_PHASES } from '../src/engine/phases';
import { createGameStore } from '../src/engine/store';
import type { EngineContext } from '../src/engine/types';
import { reduce } from '../src/engine/reducer';
import { createInitialState } from '../src/engine/initialState';
import { createDevGame } from '../src/app/dev/devSeed';

const ctx: EngineContext = { now: () => 1_000, random: () => 0.42, getCase };

describe('game store', () => {
  it('notifies subscribers and persists only when state actually changes', () => {
    const saved: number[] = [];
    let notifications = 0;

    const store = createGameStore({ context: ctx, onChange: () => saved.push(1) });
    const unsubscribe = store.subscribe(() => {
      notifications += 1;
    });

    // Illegal from HOME — must be a silent no-op.
    store.dispatch({ type: 'START_VOTING' });
    expect(notifications).toBe(0);
    expect(saved).toHaveLength(0);

    store.dispatch({ type: 'SELECT_CASE', caseId: CASE_001.id });
    expect(notifications).toBe(1);
    expect(saved).toHaveLength(1);
    expect(store.getState().phase).toBe('CASE_INTRO');

    unsubscribe();
    store.dispatch({ type: 'INTRO_COMPLETE' });
    expect(notifications).toBe(1);
  });

  it('rejects every illegal transition without allocating a new state', () => {
    // The store's no-op detection is reference-based, so this is a contract,
    // not an optimisation.
    for (const phase of GAME_PHASES) {
      const state = createDevGame(phase);
      const rejected = reduce(
        state,
        { type: 'CAST_VOTE', voterId: 'nobody', targetCharacterId: 'nobody' },
        ctx,
      );
      if (phase !== 'VOTING') expect(rejected).toBe(state);
    }
  });

  it('hydrates a dev seed and resets back to a fresh game', () => {
    const store = createGameStore({ context: ctx });
    store.dispatch({ type: 'HYDRATE', state: createDevGame('TRUTH_REVEAL') });
    expect(store.getState().phase).toBe('TRUTH_REVEAL');

    store.dispatch({ type: 'RESET' });
    expect(store.getState()).toEqual(createInitialState());
  });

  it('refuses to hydrate a payload that is not a game state', () => {
    const store = createGameStore({ context: ctx });
    store.dispatch({ type: 'HYDRATE', state: { phase: 'NOWHERE' } });
    expect(store.getState().phase).toBe('HOME');
  });
});
