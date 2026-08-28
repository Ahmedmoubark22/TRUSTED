import { Button, CharacterPortrait, Screen } from '../../components';
import {
  caseResult,
  charactersByIds,
  chosenCharacter,
  currentTruthFact,
  factEvidence,
  immediateAnswerCharacter,
  revealProgress,
} from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The truth, one layer at a time.
 *
 * One fact fills the screen and the player taps for the next. Nothing
 * auto-advances — the pacing is the point, and a room reading this out loud
 * needs to be able to stop on a line.
 *
 * The first step is the only one that mentions the vote: it says what the
 * room found and then, immediately, that it was not the whole story. Every
 * step after it is the same for every table. What the group decided changes
 * one sentence here, and nothing else.
 */
export function TruthRevealView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const fact = currentTruthFact(state, def);
  const progress = revealProgress(state, def);
  if (!fact) return null;

  const people = charactersByIds(def, fact.relatedCharacterIds);
  const objects = factEvidence(def, fact);
  const isOpening = fact.importance === 'immediate';

  return (
    <Screen
      kicker={fact.question}
      title={fact.statement}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_REVEAL' })}>
          {progress.isFinal ? 'Close the case' : 'Go on'}
        </Button>
      }
    >
      <div className={`truth${progress.isFinal ? ' truth--final' : ''}`} key={fact.id}>
        {isOpening ? <VoteComparison /> : null}

        <p className="truth__explanation" dir="auto">
          {fact.explanation}
        </p>

        {people.length > 0 || objects.length > 0 ? (
          <div className="truth__refs">
            {people.map((character) => (
              <span className="truth__ref" key={character.id}>
                <CharacterPortrait name={character.name} />
                <span className="truth__ref-name">{character.name}</span>
              </span>
            ))}
            {objects.map((item) => (
              <span className="truth__ref truth__ref--object" key={item.id}>
                <span className="truth__ref-name" dir="auto">
                  {item.title}
                </span>
              </span>
            ))}
          </div>
        ) : null}

        <p className="truth__count">
          {progress.step} of {progress.total}
        </p>
      </div>
    </Screen>
  );
}

/**
 * What the room found, said once.
 *
 * Deliberately not a verdict. A table that named the right person is told it
 * found one truth, not that it was right — and then told the story continues.
 * A table that named someone else is told that plainly, without being scored
 * for it.
 */
function VoteComparison() {
  const state = useGameState();
  const def = useCaseDefinition();

  const result = caseResult(state, def);
  const chosen = chosenCharacter(state, def);
  const answer = immediateAnswerCharacter(def);
  const phrase = def?.truth.immediateActionPhrase ?? 'took it';
  if (!answer) return null;

  return (
    <div className="found">
      {result === 'FOUND_IMMEDIATE_TRUTH' ? (
        <>
          <p className="found__line">You found one truth.</p>
          <p className="found__note">
            The room named {answer.name}, and the room was looking in the right place.
          </p>
        </>
      ) : result === 'PARTIAL_TRUTH' ? (
        <>
          <p className="found__line">Part of the room saw it.</p>
          <p className="found__note">
            {answer.name} was among the names you could not choose between.
          </p>
        </>
      ) : (
        <>
          <p className="found__line">The room looked elsewhere.</p>
          <p className="found__note">
            {chosen ? `You named ${chosen.name}. ` : ''}It was {answer.name} who {phrase}.
          </p>
        </>
      )}
      <p className="found__turn">That was not the whole story.</p>
    </div>
  );
}
