import { createContext } from 'react';
import type { GameStore } from '../engine/store';
import type { GamePersistence } from '../persistence/gameStorage';

export interface GameContextValue {
  store: GameStore;
  persistence: GamePersistence;
}

export const GameContext = createContext<GameContextValue | null>(null);
