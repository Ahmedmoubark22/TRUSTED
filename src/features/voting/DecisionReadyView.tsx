import { Button, Card, Screen } from '../../components';
import { useDispatch, useGameState } from '../../app/hooks';

export function DecisionReadyView() {
  const state = useGameState();
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Point of no return"
      title="Ready to decide"
      lede="Voting is private and sequential. Once it starts, the discussion is over."
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'START_VOTING' })}>
            Start the vote
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'RETURN_TO_TABLE' })}>
            Not yet — back to the table
          </Button>
        </>
      }
    >
      <Card title="How it works" muted>
        <p className="card__meta">
          The device passes seat by seat. Each player names one person, alone, and hands it on.
          Nobody sees a vote until everyone has cast one.
        </p>
      </Card>
      <Card title={`${state.players.length} votes to collect`} muted />
    </Screen>
  );
}
