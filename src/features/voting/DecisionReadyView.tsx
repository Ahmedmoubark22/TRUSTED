import { Button, Screen } from '../../components';
import { DECISION_QUESTION } from '../../engine/voting';
import { useDispatch, useGameState } from '../../app/hooks';

/**
 * The point of no return.
 *
 * It states the question the table is about to answer, so nobody walks into a
 * private vote unsure what they are being asked. No timer: the group arrives
 * here by saying it is ready, and leaves by saying it again.
 */
export function DecisionReadyView() {
  const state = useGameState();
  const dispatch = useDispatch();

  return (
    <Screen
      kicker="Point of no return"
      title="Ready to decide?"
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'START_VOTING' })}>
            Vote
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'RETURN_TO_TABLE' })}>
            Not yet — back to the table
          </Button>
        </>
      }
    >
      <div className="decision">
        <p className="decision__question">{DECISION_QUESTION}</p>
        <p className="decision__note">
          The device passes seat by seat. Each of you names one person, alone, and hands it on.
          Nothing is shown until all {state.players.length} votes are in.
        </p>
      </div>
    </Screen>
  );
}
