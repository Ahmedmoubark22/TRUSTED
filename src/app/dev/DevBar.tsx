import { GAME_PHASES, type GamePhase } from '../../engine/phases';
import { useDispatch, useGameState, usePersistence } from '../hooks';
import { createDevGame } from './devSeed';

/**
 * Development / test mode.
 *
 * Jumps straight to any approved phase with a coherent seeded game behind it,
 * so the full flow can be reviewed on a device in seconds. Hidden in
 * production unless `?dev=1` is present.
 */
export function DevBar() {
  const state = useGameState();
  const dispatch = useDispatch();
  const persistence = usePersistence();

  const index = GAME_PHASES.indexOf(state.phase);

  function jump(phase: GamePhase) {
    // HYDRATE rather than DEV_JUMP_TO_PHASE so the seeded prerequisites
    // (players, roles, evidence, votes) come along with the phase.
    dispatch({ type: 'HYDRATE', state: createDevGame(phase, Math.max(4, state.players.length)) });
  }

  function step(delta: number) {
    const next = GAME_PHASES[index + delta];
    if (next) jump(next);
  }

  function reset() {
    persistence.clear();
    dispatch({ type: 'RESET' });
  }

  return (
    <div className="devbar">
      <span className="devbar__label">DEV</span>
      <button type="button" className="devbar__btn" onClick={() => step(-1)} disabled={index <= 0}>
        ◀
      </button>
      <select
        className="devbar__select"
        aria-label="Jump to phase"
        value={state.phase}
        onChange={(e) => jump(e.target.value as GamePhase)}
      >
        {GAME_PHASES.map((phase) => (
          <option key={phase} value={phase}>
            {phase}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="devbar__btn"
        onClick={() => step(1)}
        disabled={index >= GAME_PHASES.length - 1}
      >
        ▶
      </button>
      <button type="button" className="devbar__btn" onClick={reset}>
        reset
      </button>
    </div>
  );
}
