import { Button, Card, Screen } from '../../components';
import { CASES } from '../../content/registry';
import { caseMetaLine, casesByPlayerCount, playerCountLabel } from '../../content/catalogue';
import { useDispatch } from '../../app/hooks';

/**
 * Choosing a case.
 *
 * Grouped by how many people it seats, because that is the only question a
 * group has already answered before it opens the app: there are five of us
 * tonight — what can we play? Everything else about a case (who these people
 * are to each other, whether the room is women or men or mixed, how long, and
 * whether it is played in rounds) rides on one line under the title.
 *
 * The headings and that line are English, like every other piece of chrome in
 * the app. Arabic here is the *content* — a case's title and its subtitle —
 * and keeping the two apart is what lets an Arabic case sit in an English
 * shell without either looking like a mistake.
 */
export function HomeView() {
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Everyone knows something"
      title="TRUSTED"
      lede="One device. Three to six people. Nobody has the whole story."
    >
      {casesByPlayerCount(CASES).map((group) => (
        <section key={group.count} className="catalogue__group">
          <h2 className="catalogue__heading">{playerCountLabel(group.count)}</h2>
          {group.cases.map((c) => (
            <Card key={c.id} title={c.title} meta={caseMetaLine(c)}>
              <p className="screen__lede" dir="auto">
                {c.subtitle}
              </p>
              <div className="screen__actions">
                <Button
                  variant="primary"
                  onClick={() => dispatch({ type: 'SELECT_CASE', caseId: c.id })}
                >
                  Open case
                </Button>
              </div>
            </Card>
          ))}
        </section>
      ))}
    </Screen>
  );
}
