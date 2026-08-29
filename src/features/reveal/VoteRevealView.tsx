import type { CharacterDefinition } from '../../content/types';
import { Button, CharacterPortrait, Screen } from '../../components';
import {
  accusedCharacter,
  charactersByIds,
  voteOutcome,
  voteRevealComplete,
  voteRevealLines,
} from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * What the room said, then what it chose.
 *
 * Two of the three facts the ending is built from, in the order they happened:
 *
 *   1. the name the table had been arguing for — its position, not its verdict
 *   2. the votes, read out one at a time, and the result they add up to
 *
 * The third — what actually happened — belongs to the truth reveal, and the
 * only way through to it is the button at the bottom of this screen.
 *
 * The accusation beat needs no new state. `voteRevealStep` already starts at
 * zero with no votes read out, so the moment before the first line is a real
 * step of the sequence that was simply standing empty.
 *
 * Nothing here is authored and nothing here grades the room: every line comes
 * from the votes that were actually submitted, and the divergence between the
 * two facts is shown by putting them next to each other, not by commenting on
 * them.
 */
export function VoteRevealView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const lines = voteRevealLines(state, def);
  const complete = voteRevealComplete(state);
  const outcome = voteOutcome(state, def);
  const accused = accusedCharacter(state, def);
  const isRevote = state.revoteCandidates.length > 0;

  const tied = outcome.kind === 'TIE' || outcome.kind === 'DEADLOCK';
  const tiedCharacters = charactersByIds(def, tied ? outcome.characterIds : []);
  const decided = outcome.kind === 'DECIDED' ? charactersByIds(def, [outcome.characterId])[0] : undefined;

  // Beat one. Before a single vote is read, the room is shown the position it
  // had talked itself into — so that whatever the ballot says next lands
  // against something.
  if (state.voteRevealStep === 0) {
    return (
      <Screen
        kicker={isRevote ? 'The revote' : 'Before the votes'}
        title={accused ? 'The room accused' : 'The room named nobody'}
        lede={
          accused
            ? 'That was the argument, not the ballot. The votes are still sealed.'
            : 'No name was ever settled on out loud. The votes are still sealed.'
        }
        actions={
          <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_VOTE_REVEAL' })}>
            Read the votes
          </Button>
        }
      >
        {accused ? (
          <div className="accused">
            <CharacterPortrait name={accused.name} />
            <p className="accused__name" dir="auto">
              {accused.name}
            </p>
          </div>
        ) : (
          <p className="lock">Nobody</p>
        )}
      </Screen>
    );
  }

  return (
    <Screen
      kicker={isRevote ? 'The revote' : 'The votes'}
      title={complete ? 'That is where the room stood' : 'Read them out'}
      actions={
        !complete ? (
          <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_VOTE_REVEAL' })}>
            Next
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
        <>
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

          <AccusedAgainstChosen accused={accused} chosen={decided} />
        </>
      ) : null}
    </Screen>
  );
}

/**
 * The two facts, side by side.
 *
 * Both rows are always drawn, even when they name the same person — the point
 * is that talking and deciding are separate acts, and a room that did both to
 * the same person did two things rather than one.
 *
 * When they differ the block is marked, and that is the whole of the comment.
 * Saying anything about what the divergence *means* would be writing case
 * material into a view, and no case authored it.
 */
function AccusedAgainstChosen({
  accused,
  chosen,
}: {
  accused: CharacterDefinition | undefined;
  chosen: CharacterDefinition | undefined;
}) {
  // Nothing to contrast until the room actually settled on somebody.
  if (!chosen) return null;
  const diverged = accused?.id !== chosen.id;

  return (
    <dl className={`contrast${diverged ? ' contrast--diverged' : ''}`}>
      <div className="contrast__row">
        <dt className="contrast__label">Accused</dt>
        <dd className="contrast__name" dir="auto">
          {accused?.name ?? 'Nobody'}
        </dd>
      </div>
      <div className="contrast__row">
        <dt className="contrast__label">Chosen</dt>
        <dd className="contrast__name" dir="auto">
          {chosen.name}
        </dd>
      </div>
    </dl>
  );
}
