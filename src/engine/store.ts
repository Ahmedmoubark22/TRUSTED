import type { GameEvent } from './events';
import { reduce } from './reducer';
import type { EngineContext, GameState } from './types';
import { createInitialState } from './initialState';

export interface GameStore {
  getState: () => GameState;
  dispatch: (event: GameEvent) => GameState;
  subscribe: (listener: () => void) => () => void;
}

export interface CreateStoreOptions {
  initialState?: GameState;
  context: EngineContext;
  /** Called after every state change. Used to persist. */
  onChange?: (state: GameState) => void;
}

/**
 * A ~30-line observable store. React binds to it with `useSyncExternalStore`;
 * no state library required, and the engine stays usable outside React.
 */
export function createGameStore({ initialState, context, onChange }: CreateStoreOptions): GameStore {
  let state = initialState ?? createInitialState();
  const listeners = new Set<() => void>();

  function dispatch(event: GameEvent): GameState {
    const next = reduce(state, event, context);
    if (next === state) return state; // rejected or no-op
    state = next;
    onChange?.(state);
    for (const listener of listeners) listener();
    return state;
  }

  return {
    getState: () => state,
    dispatch,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
