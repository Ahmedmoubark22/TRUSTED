import { Button, CharacterPortrait, Screen } from '../../components';
import { implicatedCharacters, lastPlacedEvidence } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The questions round.
 *
 * The device's whole job here is to say who has to answer, and in what order.
 * It does not run a timer, it does not collect the answers, and it does not
 * decide whether they were any good — that is four people talking, which is
 * the game. What it *does* do is stop the round collapsing into whoever is
 * loudest: the object named two people, so those two answer, and everybody
 * else gets exactly one question.
 *
 * Naming the implicated out loud is not a leak. `implicates` is authored
 * about a shared object every player has just read, and putting it on screen
 * is what makes the round fair to the quiet players at the table.
 */
export function InterrogationView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const object = lastPlacedEvidence(state, def);
  const implicated = implicatedCharacters(state, def);

  return (
    <Screen
      kicker={`Round ${state.round} of ${state.totalRounds}`}
      title="Questions"
      lede={object?.discussionPrompt}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'INTERROGATION_COMPLETE' })}>
          Enough. We&rsquo;ll vote.
        </Button>
      }
    >
      {implicated.length > 0 ? (
        <>
          <p className="rounds__lead">
            {/* The title is authored Arabic sitting inside an English line.
                <bdi> isolates its direction so the object's name reads
                right-to-left without dragging the rest of the line with it. */}
            {object ? <bdi dir="auto">{object.title}</bdi> : 'This'} points at:
          </p>
          <ul className="rounds__implicated">
            {implicated.map((character) => (
              <li key={character.id} className="rounds__implicated-item">
                <CharacterPortrait name={character.name} />
                <span className="rounds__implicated-name" dir="auto">
                  {character.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="rounds__rule">
            Each of them answers — one at a time, out loud. Then everybody else asks{' '}
            <strong>one</strong> question, to anyone.
          </p>
        </>
      ) : (
        <p className="rounds__rule">
          Everybody answers for themselves, one at a time. Then one question each.
        </p>
      )}
    </Screen>
  );
}
