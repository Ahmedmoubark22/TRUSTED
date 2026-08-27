import { Button, Card, PlaceholderNote, Screen } from '../../components';
import { evidenceCards } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function EvidenceView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();
  const cards = evidenceCards(state, def);

  return (
    <Screen
      kicker="Shared"
      title="Evidence"
      lede="Anything opened here is opened for everyone."
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'CLOSE_EVIDENCE' })}>
          Back to the table
        </Button>
      }
    >
      {cards.map(({ definition, isRevealed, isUnlocked }) => (
        <Card
          key={definition.id}
          title={definition.title}
          meta={isRevealed ? undefined : isUnlocked ? definition.teaser : 'Locked — something else has to surface first'}
          locked={!isUnlocked && !isRevealed}
        >
          {isRevealed ? (
            <p>{definition.body}</p>
          ) : (
            <div className="screen__actions">
              <Button
                disabled={!isUnlocked}
                onClick={() => dispatch({ type: 'REVEAL_EVIDENCE', evidenceId: definition.id })}
              >
                Reveal
              </Button>
            </div>
          )}
        </Card>
      ))}
      {def?.isPlaceholder ? <PlaceholderNote>Evidence is scaffolding.</PlaceholderNote> : null}
    </Screen>
  );
}
