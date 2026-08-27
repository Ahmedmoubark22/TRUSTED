import { CASE_001 } from '../src/content/cases/case-001';
import { getCase } from '../src/content/registry';
import type { GameEvent } from '../src/engine/events';
import { createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import type { EngineContext, GameState } from '../src/engine/types';

/** Deterministic context: fixed clock, fixed RNG, real case content. */
export const ctx: EngineContext = {
  now: () => 1_000,
  random: () => 0.42,
  getCase,
};

export function run(state: GameState, ...events: GameEvent[]): GameState {
  return events.reduce((s, e) => reduce(s, e, ctx), state);
}

/** A game seated and dealt, parked at the first player's closed briefing gate. */
export function seatedGame(playerCount = CASE_001.minPlayers): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_001.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: playerCount },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

/**
 * Open the gate and read every section, stopping on the pass screen.
 * Mirrors what a real player's taps do — no state is set directly.
 */
export function readBriefing(state: GameState): GameState {
  let next = run(state, { type: 'UNLOCK_BRIEFING' });
  let guard = 0;
  while (next.briefingStep !== 'HANDOFF') {
    next = run(next, { type: 'ADVANCE_BRIEFING_STEP' });
    if ((guard += 1) > 10) throw new Error('briefing never reached the pass screen');
  }
  return next;
}

/** Read the current briefing, then hand the device to the next player. */
export function briefOnePlayer(state: GameState): GameState {
  return run(readBriefing(state), { type: 'ADVANCE_BRIEFING' });
}

/** Brief everyone in seat order. Ends at TABLE. */
export function briefAllPlayers(state: GameState): GameState {
  let next = state;
  for (let i = 0; i < state.players.length; i += 1) next = briefOnePlayer(next);
  return next;
}
