import { useContext, useSyncExternalStore } from 'react';
import type { CaseDefinition } from '../content/types';
import { getCase } from '../content/registry';
import type { GameEvent } from '../engine/events';
import type { GameState } from '../engine/types';
import { GameContext, type GameContextValue } from './gameContext';

function useGameContext(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame* must be used inside <GameProvider>.');
  return value;
}

/** The one authoritative state. Views read; they never own gameplay facts. */
export function useGameState(): GameState {
  const { store } = useGameContext();
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export function useDispatch(): (event: GameEvent) => void {
  const { store } = useGameContext();
  return store.dispatch;
}

/** The authored case for the current game, if one is selected. */
export function useCaseDefinition(): CaseDefinition | undefined {
  const state = useGameState();
  return getCase(state.caseId);
}

export function usePersistence() {
  return useGameContext().persistence;
}
