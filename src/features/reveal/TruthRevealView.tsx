import { Button, Card, PlaceholderNote, Screen } from '../../components';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function TruthRevealView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const beats = def?.truthBeats ?? [];
  const beat = beats[state.revealBeat];
  const isLast = state.revealBeat >= beats.length - 1;

  return (
    <Screen
      kicker={`Layer ${state.revealBeat + 1} of ${beats.length}`}
      title={beat?.title ?? 'The truth'}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_TRUTH_BEAT' })}>
          {isLast ? 'Close the case' : 'Keep going'}
        </Button>
      }
    >
      <Card>
        <p>{beat?.body}</p>
      </Card>
      {def?.isPlaceholder ? <PlaceholderNote>Reveal text is scaffolding.</PlaceholderNote> : null}
    </Screen>
  );
}
