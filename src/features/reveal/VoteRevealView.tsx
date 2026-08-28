import { Button, CharacterPortrait, Screen } from '../../components';
import {
  charactersByIds,
  voteOutcome,
  voteRevealComplete,
  voteRevealLines,
} from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The votes, read out one at a time.
 *
 * Deliberately sequential: the point of the moment is watching the room find
 * out where it stood, not reading a bar chart. Every line and the result come
 * from the submitted votes — nothing here is authored, and nothing here says
 * whether the room was right. That is the truth reveal's job, and it has not
 * been written.
 */
export function VoteRevealView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const lines = voteRevealLines(state, def);
  const complete = voteRevealComplete(state);
  const outcome = voteOutcome(state, def);
  const tied = outcome.kind === 'TIE' || outcome.kind === 'DEADLOCK';
  const tiedCharacters = charactersByIds(def, tied ? outcome.characterIds : []);
  const decided = outcome.kind === 'DECIDED' ? charactersByIds(def, [outcome.characterId])[0] : undefined;

  return (
    <Screen
      kicker={state.revoteCandidates.length > 0 ? 'The revote' : 'The votes'}
      title={complete ? 'That is where the room stood' : 'Read them out'}
      actions={
        !complete ? (
          <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_VOTE_REVEAL' })}>
            {lines.length === 0 ? 'Show the first vote' : 'Next'}
          </Button>
        ) : outcome.kind === 'TIE' ? (
          <Button variant="primary" onClick={() => dispatch({ type: 'START_REVOTE' })}>
            Vote again
          </Button>
        ) : (
          <Button variant="primary" onClick={() => dispatch({ type: 'SHOW_TRUTH' })}>
            Show the truth
          </Button>
        )
      }
    >
      <ol className="tally">
        {lines.map((line, i) => (
          // Index-keyed on purpose: lines only ever append, in seat order.
          <li className="tally__line" key={i}>
            <CharacterPortrait name={line.voter?.name ?? '?'} />
            <span className="tally__voter">{line.voter?.name ?? 'Unassigned'}</span>
            <span className="tally__arrow" aria-hidden="true">
              →
            </span>
            <span className="tally__target">{line.target?.name ?? 'Nobody'}</span>
          </li>
        ))}
      </ol>

      {complete ? (
        <div className="verdict">
          {decided ? (
            <>
              <p className="verdict__label">The group chose</p>
              <p className="verdict__name" dir="auto">
                {decided.name}
              </p>
            </>
          ) : outcome.kind === 'TIE' ? (
            <>
              <p className="verdict__label">The room is split</p>
              <p className="verdict__name" dir="auto">
                {tiedCharacters.map((c) => c.name).join(' · ')}
              </p>
              <p className="verdict__note">
                Vote again, between {tiedCharacters.length === 2 ? 'these two' : 'these'} only.
              </p>
            </>
          ) : (
            <>
              <p className="verdict__label">The group could not agree</p>
              <p className="verdict__name" dir="auto">
                {tiedCharacters.map((c) => c.name).join(' · ')}
              </p>
              <p className="verdict__note">The room stayed split. Nobody was chosen.</p>
            </>
          )}
        </div>
      ) : null}
    </Screen>
  );
}
