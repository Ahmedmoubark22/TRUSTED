import { Button, Card, Screen } from '../../components';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function TableView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const total = def?.evidence.length ?? 0;

  return (
    <Screen
      kicker={def?.title}
      title="The table"
      lede="Everyone has read their briefing. Now find out what the others are holding."
      actions={
        <>
          <Button onClick={() => dispatch({ type: 'OPEN_EVIDENCE' })}>
            Evidence · {state.revealedEvidence.length}/{total}
          </Button>
          <Button onClick={() => dispatch({ type: 'OPEN_DISCUSSION' })}>Discussion</Button>
          <Button variant="primary" onClick={() => dispatch({ type: 'READY_TO_DECIDE' })}>
            Ready to vote
          </Button>
        </>
      }
    >
      <Card title="Where you are" meta={`${state.players.length} players seated`} muted>
        <p className="card__meta">
          Talk out loud. Ask for what you need. The device only holds what can be proved.
        </p>
      </Card>
    </Screen>
  );
}
