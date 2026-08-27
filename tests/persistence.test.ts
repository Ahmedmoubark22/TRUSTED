import { describe, expect, it } from 'vitest';
import { createDevGame } from '../src/app/dev/devSeed';
import { createInitialState } from '../src/engine/initialState';
import { GAME_STATE_KEY, createGamePersistence } from '../src/persistence/gameStorage';
import { createMemoryStore } from '../src/persistence/storage';

describe('game persistence', () => {
  it('round-trips a game in progress', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    const state = createDevGame('VOTING');

    persistence.save(state);
    expect(persistence.load()).toEqual(state);
  });

  it('returns null when nothing has been saved', () => {
    expect(createGamePersistence(createMemoryStore()).load()).toBeNull();
  });

  it('clears a saved game', () => {
    const store = createMemoryStore();
    const persistence = createGamePersistence(store);
    persistence.save(createInitialState());
    persistence.clear();
    expect(persistence.load()).toBeNull();
  });

  it('discards unparseable payloads instead of crashing', () => {
    const store = createMemoryStore();
    store.set(GAME_STATE_KEY, '{ not json');
    expect(createGamePersistence(store).load()).toBeNull();
  });

  it('discards payloads that are not a valid game state', () => {
    const store = createMemoryStore();
    store.set(GAME_STATE_KEY, JSON.stringify({ phase: 'ELSEWHERE', players: 'many' }));
    expect(createGamePersistence(store).load()).toBeNull();
  });

  it('never blows up when storage refuses to write', () => {
    const persistence = createGamePersistence({
      get: () => null,
      set: () => {
        throw new Error('QuotaExceededError');
      },
      remove: () => {},
    });
    expect(() => persistence.save(createInitialState())).not.toThrow();
  });
});
