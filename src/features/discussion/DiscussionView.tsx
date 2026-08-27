import { Button, Card, Screen } from '../../components';
import { useDispatch } from '../../app/hooks';

export function DiscussionView() {
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Out loud"
      title="Discussion"
      lede="The device stays face up. This part happens between people."
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'READY_TO_DECIDE' })}>
            We are ready to vote
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'CLOSE_DISCUSSION' })}>
            Back to the table
          </Button>
        </>
      }
    >
      <Card title="Suggested order" muted>
        <p className="card__meta">
          Each player accounts for themselves, then answers one question from the table.
        </p>
      </Card>
    </Screen>
  );
}
