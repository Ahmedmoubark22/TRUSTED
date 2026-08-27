import type { GameState } from '../engine/types';
import { isGameState, migrate } from '../engine/validate';
import { createLocalStore, type KeyValueStore } from './storage';

export const GAME_STATE_KEY = 'trusted.game.v1';

/**
 * Persists the one authoritative state so a mis-tap, a locked screen, or a
 * refresh mid-case does not lose the table's progress.
 */
export interface GamePersistence {
  load: () => GameState | null;
  save: (state: GameState) => void;
  clear: () => void;
}

export function createGamePersistence(store: KeyValueStore = createLocalStore()): GamePersistence {
  return {
    load() {
      const raw = store.get(GAME_STATE_KEY);
      if (!raw) return null;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        store.remove(GAME_STATE_KEY);
        return null;
      }
      // Unknown or corrupt payloads are dropped, never partially trusted.
      if (!isGameState(parsed)) {
        const migrated = migrate(parsed);
        store.remove(GAME_STATE_KEY);
        return migrated.phase === 'HOME' ? null : migrated;
      }
      return parsed;
    },

    save(state) {
      try {
        store.set(GAME_STATE_KEY, JSON.stringify(state));
      } catch {
        /* non-serialisable state should be impossible; never block play */
      }
    },

    clear() {
      store.remove(GAME_STATE_KEY);
    },
  };
}
