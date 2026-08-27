import { useEffect } from 'react';
import { Button, Card, Screen } from '../../components';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

export function CharacterAssignmentView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const dealt = Object.keys(state.assignments).length === state.players.length;

  // Roles are dealt by the engine on arrival; the view only asks for it.
  useEffect(() => {
    if (!dealt) dispatch({ type: 'DEAL_CHARACTERS' });
  }, [dealt, dispatch]);

  return (
    <Screen
      kicker="Step two"
      title="Roles are dealt"
      lede="Nobody sees another player's role. Not now, not later."
      actions={
        <>
          <Button variant="primary" disabled={!dealt} onClick={() => dispatch({ type: 'CONFIRM_ASSIGNMENTS' })}>
            Begin private briefings
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'DEAL_CHARACTERS' })}>
            Re-deal
          </Button>
        </>
      }
    >
      {state.players.map((player) => (
        <Card key={player.id} title={player.name} meta={def ? 'Role assigned — sealed' : 'No case loaded'} muted />
      ))}
    </Screen>
  );
}
