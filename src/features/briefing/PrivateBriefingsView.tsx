import { useState } from 'react';
import { Button, Card, PlaceholderNote, PrivateNotice, Screen } from '../../components';
import { characterFor, currentBriefingPlayer } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function PrivateBriefingsView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  // Local-only: whether the current holder has chosen to look yet. This is
  // presentation, not a gameplay fact, so it does not belong in game state.
  const [revealed, setRevealed] = useState(false);

  const player = currentBriefingPlayer(state);
  if (!player) return null;

  const character = characterFor(state, def, player.id);
  const remaining = state.players.length - state.briefingCursor - 1;

  function next() {
    setRevealed(false);
    dispatch({ type: 'ADVANCE_BRIEFING' });
  }

  if (!revealed) {
    return (
      <Screen
        kicker={`${state.briefingCursor + 1} of ${state.players.length}`}
        title={`Pass to ${player.name}`}
        lede="Hand the device over before tapping."
        actions={
          <Button variant="primary" onClick={() => setRevealed(true)}>
            I am {player.name}
          </Button>
        }
      >
        <PrivateNotice playerName={player.name} />
      </Screen>
    );
  }

  return (
    <Screen
      kicker="Your briefing"
      title={character?.name ?? 'Unassigned'}
      lede={character?.publicRole}
      actions={
        <Button variant="primary" onClick={next}>
          {remaining > 0 ? 'Done — pass the device' : 'Done — return to the table'}
        </Button>
      }
    >
      <PrivateNotice playerName={player.name} />
      <Card title="What you know">
        <p>{character?.privateBriefing}</p>
      </Card>
      <Card title="What you want" muted>
        <ul>
          {character?.privateObjectives.map((objective, i) => (
            <li key={i}>{objective}</li>
          ))}
        </ul>
      </Card>
      {def?.isPlaceholder ? <PlaceholderNote>Briefing text is scaffolding.</PlaceholderNote> : null}
    </Screen>
  );
}
