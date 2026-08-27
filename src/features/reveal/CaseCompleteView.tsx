import { Button, Card, Screen } from '../../components';
import { accusedPlayers, characterFor, culpritPlayer } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function CaseCompleteView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const culprit = culpritPlayer(state, def);
  const accused = accusedPlayers(state);
  const tableWasRight = accused.length === 1 && accused[0]?.playerId === culprit?.id;

  return (
    <Screen
      kicker="Case closed"
      title={tableWasRight ? 'The table was right' : 'The table was wrong'}
      lede={culprit ? `${culprit.name} was responsible.` : undefined}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'BACK_TO_HOME' })}>
          Back to cases
        </Button>
      }
    >
      {state.players.map((player) => {
        const character = characterFor(state, def, player.id);
        return (
          <Card
            key={player.id}
            title={player.name}
            meta={character ? character.name : 'Unassigned'}
            muted
          />
        );
      })}
    </Screen>
  );
}
