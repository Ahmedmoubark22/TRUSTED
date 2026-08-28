import { Button, Card, PlaceholderNote, Screen } from '../../components';
import { characterFor } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * Who everyone was.
 *
 * It deliberately does not say whether the room got it right. Judging the
 * vote needs an authored resolution, and this case does not have one yet —
 * claiming a verdict off an unauthored culprit would be inventing the answer.
 * The seating chart is the honest thing to show until the reveal is written.
 */
export function CaseCompleteView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  return (
    <Screen
      kicker="Case closed"
      title="Everyone knew something"
      lede="This is who was sitting where."
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
      {def?.isPlaceholder ? <PlaceholderNote>The resolution is not written yet.</PlaceholderNote> : null}
    </Screen>
  );
}
