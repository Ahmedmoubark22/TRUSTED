import { Button, Screen } from '../../components';
import { lastPlacedEvidence } from '../../engine/selectors';
import { useCaseDefinition, useDispatch, useGameState } from '../../app/hooks';

/**
 * The quiet screen.
 *
 * Discussion is the part of TRUSTED that happens between people, so the device
 * gets out of the way: the object that just landed, the question it raised,
 * and one way out. No chat, no timer, no turn order, no prompting — the group
 * decides when it is done, and says so.
 */
export function DiscussionView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const def = useCaseDefinition();

  const latest = lastPlacedEvidence(state, def);

  return (
    <Screen
      kicker={latest ? latest.title : undefined}
      title="Discuss"
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'DISCUSSION_COMPLETE' })}>
          We&rsquo;re ready
        </Button>
      }
    >
      <div className="discuss">
        <p className="discuss__prompt" dir="auto">
          {latest?.discussionPrompt ?? 'What do you think?'}
        </p>
      </div>
    </Screen>
  );
}
