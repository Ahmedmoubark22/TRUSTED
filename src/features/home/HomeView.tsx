import { Button, Card, Screen } from '../../components';
import { CASES } from '../../content/registry';
import { useDispatch } from '../../app/hooks';

export function HomeView() {
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Everyone knows something"
      title="TRUSTED"
      lede="One device. Three to six people. Nobody has the whole story."
    >
      {CASES.map((c) => (
        <Card key={c.id} title={c.title} meta={`${c.minPlayers}–${c.maxPlayers} players · ~${c.estimatedMinutes} min`}>
          <p className="screen__lede">{c.subtitle}</p>
          <div className="screen__actions">
            <Button variant="primary" onClick={() => dispatch({ type: 'SELECT_CASE', caseId: c.id })}>
              Open case
            </Button>
          </div>
        </Card>
      ))}
    </Screen>
  );
}
