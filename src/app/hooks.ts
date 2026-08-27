import { useContext, useSyncExternalStore } from 'react';
import type { CaseDefinition, PrivateBriefing } from '../content/types';
import { getCase } from '../content/registry';
import { getPrivateBriefing } from '../content/briefings';
import type { GameEvent } from '../engine/events';
import { revealableCharacterId } from '../engine/selectors';
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

/**
 * The single bridge between the engine's privacy gate and the authored
 * private content.
 *
 * The engine decides *whose* briefing may be shown; content supplies *what*
 * it says. Neither half can leak on its own — and this hook returns
 * `undefined` the instant the gate closes, so the briefing text has no way to
 * outlive the moment it is allowed on screen.
 *
 * This is the only supported way for a component to reach private content.
 */
export function useCurrentBriefing(): PrivateBriefing | undefined {
  const state = useGameState();
  const characterId = revealableCharacterId(state);
  return getPrivateBriefing(state.caseId, characterId);
}

export function usePersistence() {
  return useGameContext().persistence;
}
