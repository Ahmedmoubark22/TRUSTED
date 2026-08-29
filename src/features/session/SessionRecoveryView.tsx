import { Button, Screen } from '../../components';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The interrupted game, handed back deliberately.
 *
 * Reached only when a session is restored from somewhere the app must not walk
 * straight into — a private vote that was part-way round the table. The device
 * was mid-handoff when it was closed, and whoever opens it next is not
 * necessarily whoever put it down, so the table is asked rather than dropped
 * back onto a ballot.
 *
 * Neither choice is destructive by accident: continuing keeps every locked
 * vote exactly as it was, and starting over is an explicit decision the table
 * has to make out loud.
 */
export function SessionRecoveryView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const votesIn = Object.keys(state.votes).length;

  return (
    <Screen
      kicker={def?.title}
      title="استكمال اللعبة؟"
      lede="This game was interrupted during the vote. Nothing has been lost — the votes already locked in are still sealed."
      actions={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: 'RESUME_SESSION' })}>
            Continue this game
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'RESTART_SESSION' })}>
            Start the case again
          </Button>
        </>
      }
    >
      <div className="decision">
        <p className="decision__note">
          {votesIn === 0
            ? 'The vote had started, but nobody had locked one in yet.'
            : `${votesIn} of ${state.players.length} votes were locked in before the game was closed.`}
        </p>
        <p className="decision__note">
          Continuing picks up at the same seat, sealed. Starting again begins this case from the
          top with a new table, and this group&rsquo;s progress is discarded.
        </p>
      </div>
    </Screen>
  );
}
