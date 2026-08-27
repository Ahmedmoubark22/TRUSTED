import { Button, Screen } from '../../components';
import { MAX_PLAYERS, MIN_PLAYERS } from '../../engine/initialState';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function PlayerSetupView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const min = Math.max(MIN_PLAYERS, def?.minPlayers ?? MIN_PLAYERS);
  const max = Math.min(MAX_PLAYERS, def?.maxPlayers ?? MAX_PLAYERS);
  const count = state.players.length;

  return (
    <Screen
      kicker="Step one"
      title="Who is here?"
      lede="Seat order decides who gets the device next."
      actions={
        <>
          <Button
            variant="primary"
            disabled={count < min || count > max}
            onClick={() => dispatch({ type: 'CONFIRM_PLAYERS' })}
          >
            Deal roles
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'BACK_TO_HOME' })}>
            Back
          </Button>
        </>
      }
    >
      <div className="field">
        <Button block={false} disabled={count <= min} onClick={() => dispatch({ type: 'SET_PLAYER_COUNT', count: count - 1 })}>
          −
        </Button>
        <span className="card__meta" style={{ flex: 1, textAlign: 'center' }}>
          {count} players
        </span>
        <Button block={false} disabled={count >= max} onClick={() => dispatch({ type: 'SET_PLAYER_COUNT', count: count + 1 })}>
          +
        </Button>
      </div>

      <div className="stack">
        {state.players.map((player) => (
          <label key={player.id} className="field">
            <span className="seat">{player.seat + 1}</span>
            <input
              className="field__input"
              value={player.name}
              maxLength={24}
              aria-label={`Name for seat ${player.seat + 1}`}
              onChange={(e) => dispatch({ type: 'RENAME_PLAYER', playerId: player.id, name: e.target.value })}
            />
          </label>
        ))}
      </div>
    </Screen>
  );
}
