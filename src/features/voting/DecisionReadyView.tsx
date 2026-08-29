import { Button, Screen } from '../../components';
import { decisionQuestionFor } from '../../engine/voting';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

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
  const def = useCaseDefinition();

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
        {/* Act 6, for the cases that author one. Structural facilitation only:
            it announces the beat and states the rule. What each player may
            actually say is private and stays in their own briefing, so this
            line can be read aloud by anyone without leaking anything. */}
        {def?.confrontationPrompt ? (
          <p className="decision__confrontation" dir="auto">
            {def.confrontationPrompt}
          </p>
        ) : null}
        <p className="decision__question" dir="auto">
          {decisionQuestionFor(def)}
        </p>
        <p className="decision__note">
          The device passes seat by seat. Each of you names one person, alone, and hands it on.
          Nothing is shown until all {state.players.length} votes are in.
        </p>
      </div>
    </Screen>
  );
}
