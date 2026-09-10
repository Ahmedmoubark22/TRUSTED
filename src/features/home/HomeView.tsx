import { Button, Card, Screen } from '../../components';
import type { CaseDefinition } from '../../content/types';
import { CASES } from '../../content/registry';
import { useDispatch } from '../../app/hooks';

/**
 * The line under a case's title.
 *
 * A case authored for exactly four people was reading "4–4 players", because
 * the range was printed whether or not it was a range. Most cases in this
 * collection are written for one exact number of seats — the briefings are
 * authored per character — so the range is the exception, not the format.
 */
function caseMeta(def: CaseDefinition): string {
  const seats =
    def.minPlayers === def.maxPlayers
      ? `${def.minPlayers} player${def.minPlayers === 1 ? '' : 's'}`
      : `${def.minPlayers}–${def.maxPlayers} players`;
  return `${seats} · ~${def.estimatedMinutes} min`;
}

export function HomeView() {
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Everyone knows something"
      title="TRUSTED"
      lede="One device. Three to six people. Nobody has the whole story."
    >
      {CASES.map((c) => (
        <Card key={c.id} title={c.title} meta={caseMeta(c)}>
          <p className="screen__lede" dir="auto">
            {c.subtitle}
          </p>
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
