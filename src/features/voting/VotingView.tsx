import { useState } from 'react';
import { Button, PrivateNotice, Screen } from '../../components';
import { currentVoter } from '../../engine/selectors';
import { useDispatch, useGameState } from '../../app/hooks';

export function VotingView() {
  const state = useGameState();
  const dispatch = useDispatch();

  // Handoff gate — presentation only, reset for each voter.
  const [atDevice, setAtDevice] = useState(false);

  const voter = currentVoter(state);
  if (!voter) return null;

  function castVote(accusedId: string) {
    setAtDevice(false);
    if (voter) dispatch({ type: 'CAST_VOTE', voterId: voter.id, accusedId });
  }

  if (!atDevice) {
    return (
      <Screen
        kicker={`Vote ${state.voteCursor + 1} of ${state.players.length}`}
        title={`Pass to ${voter.name}`}
        lede="Hand the device over face down."
        actions={
          <Button variant="primary" onClick={() => setAtDevice(true)}>
            I am {voter.name}
          </Button>
        }
      >
        <PrivateNotice playerName={voter.name} />
      </Screen>
    );
  }

  return (
    <Screen kicker="Private" title="Who did it?" lede="One name. You cannot change it.">
      <PrivateNotice playerName={voter.name} />
      <div className="stack">
        {state.players.map((candidate) => (
          <Button
            key={candidate.id}
            disabled={candidate.id === voter.id}
            onClick={() => castVote(candidate.id)}
          >
            {candidate.name}
            {candidate.id === voter.id ? ' (you)' : ''}
          </Button>
        ))}
      </div>
    </Screen>
  );
}
