import { Button, CharacterPortrait, Screen } from '../../components';
import { caseResult, characterFor, immediateAnswerCharacter } from '../../engine/selectors';
import type { TruthResult } from '../../engine/truth';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * Case closed.
 *
 * The result line describes what the room found and stops there. No score, no
 * "you win", and no claim that the table was right or wrong overall — it read
 * six more truths after the vote, and none of those were on the ballot.
 */
export function CaseCompleteView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const result = caseResult(state, def);
  const answer = immediateAnswerCharacter(def);

  return (
    <Screen
      kicker="Case closed"
      title={HEADLINE[result]}
      lede={answer ? summary(result, answer.name) : undefined}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'BACK_TO_HOME' })}>
          Back to cases
        </Button>
      }
    >
      <p className="closing">Everyone knew something. Nobody knew all of it.</p>
      <ul className="roster">
        {state.players.map((player) => {
          const character = characterFor(state, def, player.id);
          return (
            <li className="roster__row" key={player.id}>
              <CharacterPortrait name={character?.name ?? player.name} />
              <span className="roster__character">{character?.name ?? 'Unassigned'}</span>
              <span className="roster__player">{player.name}</span>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}

const HEADLINE: Record<TruthResult, string> = {
  FOUND_IMMEDIATE_TRUTH: 'The group found part of the truth',
  PARTIAL_TRUTH: 'The group came close',
  MISSED_IMMEDIATE_TRUTH: 'The group missed the immediate truth',
};

function summary(result: TruthResult, answerName: string): string {
  switch (result) {
    case 'FOUND_IMMEDIATE_TRUTH':
      return `You identified who took the letter. What was underneath it, ${answerName} never said out loud.`;
    case 'PARTIAL_TRUTH':
      return `${answerName} was among your names, but the room never settled on one.`;
    case 'MISSED_IMMEDIATE_TRUTH':
      return `It was ${answerName} who took the letter — and his reason was not the one you were looking for.`;
  }
}
