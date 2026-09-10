import { Button, Screen } from '../../components';
import { votingPlayers } from '../../engine/selectors';
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

  // An `interrogation` case has no TABLE phase to step back to, so offering
  // the door would drop the room on a screen this mode never uses.
  const hasTable = def?.mode !== 'interrogation';
  // Not every seat votes in every round — a cleared character's player sits
  // out until the last one. Promising five votes and collecting four is how a
  // table decides the app has lost their ballot.
  const voters = votingPlayers(state).length;

  return (
    <Screen
      kicker="Point of no return"
      title="Ready to decide?"
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'START_VOTING' })}>
            Vote
          </Button>
          {hasTable ? (
            <Button variant="ghost" onClick={() => dispatch({ type: 'RETURN_TO_TABLE' })}>
              Not yet — back to the table
            </Button>
          ) : null}
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
          Nothing is shown until all {voters} votes are in.
        </p>
      </div>
    </Screen>
  );
}
