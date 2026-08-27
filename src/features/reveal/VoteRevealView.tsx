import { Button, Card, Screen } from '../../components';
import { accusedPlayers, voteTally } from '../../engine/selectors';
import { useDispatch, useGameState } from '../../app/hooks';

export function VoteRevealView() {
  const state = useGameState();
  const dispatch = useDispatch();

  const tally = voteTally(state);
  const accused = accusedPlayers(state);
  const headline =
    accused.length === 0
      ? 'No votes were cast'
      : accused.length > 1
        ? `Tied: ${accused.map((a) => a.name).join(' and ')}`
        : `The table accuses ${accused[0]?.name}`;

  return (
    <Screen
      kicker="Votes are in"
      title={headline}
      lede="This is what the room believed."
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'SHOW_TRUTH' })}>
          Show the truth
        </Button>
      }
    >
      {tally.map((row) => (
        <Card key={row.playerId} title={row.name} meta={`${row.votes} vote${row.votes === 1 ? '' : 's'}`} muted />
      ))}
    </Screen>
  );
}
