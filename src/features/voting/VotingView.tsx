import { useState } from 'react';
import { Button, CharacterPortrait, Screen } from '../../components';
import type { CharacterDefinition, CharacterId } from '../../content/types';
import { ballotOptions, currentVoter } from '../../engine/selectors';
import { DECISION_QUESTION } from '../../engine/voting';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';
import type { Player } from '../../engine/types';

/**
 * The private vote.
 *
 * Structurally the same as the private briefing, for the same reason: the
 * device is being handed between people who must not see each other's screen.
 * A closed gate, one player's content, then a pass. The engine decides whose
 * turn it is and what they may name; this view only asks.
 */
export function VotingView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const voter = currentVoter(state);
  if (!voter) return null;

  const position = `${state.voteCursor + 1} of ${state.players.length}`;
  const isRevote = state.revoteCandidates.length > 0;

  // The gate. No ballot has been built at this point — `ballotOptions` returns
  // nothing while the step is LOCKED, so there is no vote on this screen to
  // reveal, and nothing of the last player's left to clear.
  if (state.voteStep === 'LOCKED') {
    return (
      <Screen
        kicker={state.voteResumed ? 'Private vote in progress' : `Private · ${position}`}
        title={state.voteResumed ? 'This vote was interrupted' : `Pass to ${voter.name}`}
        lede={
          state.voteResumed
            ? `Nothing is shown until ${voter.name} confirms they are holding the device. Any choice they had not locked in is gone.`
            : 'Hand the device over before tapping. Nobody else should be able to see the screen.'
        }
        actions={
          <Button variant="primary" onClick={() => dispatch({ type: 'UNLOCK_VOTE' })}>
            I am {voter.name}
          </Button>
        }
      >
        <p className="lock">Sealed</p>
      </Screen>
    );
  }

  const options = ballotOptions(state, def);

  return (
    <Ballot
      // Remounting per voter is what clears the selection. The previous
      // player's choice is not hidden or overwritten — the component that
      // held it no longer exists.
      key={voter.id}
      voter={voter}
      position={position}
      isRevote={isRevote}
      options={options}
      onLock={(targetCharacterId) =>
        dispatch({ type: 'CAST_VOTE', voterId: voter.id, targetCharacterId })
      }
    />
  );
}

interface BallotProps {
  voter: Player;
  position: string;
  isRevote: boolean;
  options: CharacterDefinition[];
  onLock: (targetCharacterId: CharacterId) => void;
}

function Ballot({ voter, position, isRevote, options, onLock }: BallotProps) {
  /*
   * The selection lives here and nowhere else.
   *
   * It is deliberately not in game state: an unlocked choice is not a fact
   * about the game, and keeping it local means it is never serialised, never
   * persisted, and cannot survive the handoff or a refresh.
   */
  const [selected, setSelected] = useState<CharacterId | null>(null);

  return (
    <Screen
      kicker={isRevote ? `Revote · ${position}` : `Private · ${position}`}
      title={DECISION_QUESTION}
      lede={isRevote ? 'The room was split. Choose between the two it was split over.' : undefined}
      actions={
        <Button
          variant="primary"
          disabled={selected === null}
          onClick={() => selected && onLock(selected)}
        >
          {selected === null ? 'Choose one' : 'Lock vote'}
        </Button>
      }
    >
      <ul className="ballot">
        {options.map((character) => {
          const isSelected = selected === character.id;
          return (
            <li key={character.id}>
              <button
                type="button"
                className={`ballot__option${isSelected ? ' ballot__option--selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelected(character.id)}
              >
                <CharacterPortrait name={character.name} />
                <span className="ballot__name">{character.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="ballot__note">
        {voter.name}, this cannot be changed once locked.
      </p>
    </Screen>
  );
}
