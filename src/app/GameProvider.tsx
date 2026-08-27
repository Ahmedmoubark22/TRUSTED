import { useState, type ReactNode } from 'react';
import { getCase } from '../content/registry';
import { createGameStore } from '../engine/store';
import type { EngineContext, GameState } from '../engine/types';
import { createGamePersistence, type GamePersistence } from '../persistence/gameStorage';
import { createMemoryStore } from '../persistence/storage';
import { GameContext, type GameContextValue } from './gameContext';

interface GameProviderProps {
  children: ReactNode;
  /** Override the starting state (tests, dev seeds). Skips restore. */
  initialState?: GameState;
  /** Override persistence (tests use an in-memory store). */
  persistence?: GamePersistence;
}

export function GameProvider({ children, initialState, persistence }: GameProviderProps) {
  // Built once per provider instance; the store outlives every render.
  const [value] = useState<GameContextValue>(() => {
    const persist =
      persistence ??
      // A caller-supplied state is a test or dev seed — never let it overwrite
      // a real interrupted game in localStorage.
      (initialState ? createGamePersistence(createMemoryStore()) : createGamePersistence());

    const context: EngineContext = {
      now: () => Date.now(),
      random: () => Math.random(),
      getCase,
    };

    const store = createGameStore({
      // Restore an interrupted case unless the caller supplied a state.
      initialState: initialState ?? persist.load() ?? undefined,
      context,
      onChange: (state) => persist.save(state),
    });

    return { store, persistence: persist };
  });

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
