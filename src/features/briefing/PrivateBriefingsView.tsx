import { Button, Screen } from '../../components';
import { useCurrentBriefing, useDispatch, useGameState } from '../../app/hooks';
import {
  ADVANCE_LABELS,
  SECTION_LABELS,
  isBriefingSection,
  nextBriefingStep,
  visibleSections,
  type BriefingSection,
} from '../../engine/briefing';
import { currentBriefingPlayer, nextBriefingPlayer } from '../../engine/selectors';
import type { PrivateBriefing } from '../../content/types';

/**
 * One briefing experience, driven entirely by data.
 *
 * There is no per-character view and no per-character branch — all four
 * characters run the identical sequence, differing only in the briefing the
 * gate hands over. Adding a fifth character adds content, not code.
 */
export function PrivateBriefingsView() {
  const state = useGameState();
  const dispatch = useDispatch();
  const briefing = useCurrentBriefing();

  const player = currentBriefingPlayer(state);
  if (!player) return null;

  const position = `${state.briefingCursor + 1} of ${state.players.length}`;

  // The gate. No briefing has been fetched at this point — `useCurrentBriefing`
  // returns undefined while the step is LOCKED, so there is nothing on this
  // screen to reveal, hide, or accidentally paint.
  if (state.briefingStep === 'LOCKED') {
    return (
      <Screen
        kicker={state.briefingResumed ? 'Private session in progress' : `Private · ${position}`}
        title={state.briefingResumed ? 'This briefing was interrupted' : `Pass to ${player.name}`}
        lede={
          state.briefingResumed
            ? `Nothing is shown until ${player.name} confirms they are holding the device.`
            : 'Hand the device over before tapping. Nobody else should be able to see the screen.'
        }
        actions={
          <Button variant="primary" onClick={() => dispatch({ type: 'UNLOCK_BRIEFING' })}>
            I am {player.name}
          </Button>
        }
      >
        <p className="lock">Sealed</p>
      </Screen>
    );
  }

  // The pass screen. The gate has already closed again — `briefing` is
  // undefined here too, so the outgoing player's secrets are gone from the
  // component before the phone starts moving.
  if (state.briefingStep === 'HANDOFF') {
    const next = nextBriefingPlayer(state);
    return (
      <Screen
        kicker="Briefed"
        title="Pass the phone"
        lede={
          next
            ? `${player.name} is done. Hand the device to ${next.name}.`
            : `${player.name} is done. Everyone has been briefed.`
        }
        actions={
          <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_BRIEFING' })}>
            {next ? `Pass to ${next.name}` : 'Open the table'}
          </Button>
        }
      >
        <p className="lock">Sealed</p>
      </Screen>
    );
  }

  if (!briefing) return null;

  const sections = visibleSections(state.briefingStep);
  const upcoming = nextBriefingStep(state.briefingStep);
  // The last tap of a briefing leaves the sections behind and heads for the
  // pass screen, so it reads as readiness rather than as another reveal.
  const nextLabel = upcoming && isBriefingSection(upcoming) ? ADVANCE_LABELS[upcoming] : "I'm ready";

  return (
    <Screen
      kicker={`Private · ${player.name}`}
      title={briefing.identity}
      actions={
        <Button variant="primary" onClick={() => dispatch({ type: 'ADVANCE_BRIEFING_STEP' })}>
          {nextLabel}
        </Button>
      }
    >
      {/* Keyed by player so nothing from the previous briefing can survive a
          handoff, even as a detached node React might otherwise reuse. */}
      <div className="briefing" key={player.id}>
        {sections
          .filter((section) => section !== 'IDENTITY')
          .map((section) => (
            <BriefingSectionBlock key={section} section={section} briefing={briefing} />
          ))}
      </div>
    </Screen>
  );
}

function BriefingSectionBlock({
  section,
  briefing,
}: {
  section: BriefingSection;
  briefing: PrivateBriefing;
}) {
  const lines = sectionLines(section, briefing);
  return (
    <section className="briefing__section">
      <h2 className="briefing__label">{SECTION_LABELS[section]}</h2>
      {lines.length === 1 ? (
        <p className="briefing__line">{lines[0]}</p>
      ) : (
        <ul className="briefing__list">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function sectionLines(section: BriefingSection, briefing: PrivateBriefing): string[] {
  switch (section) {
    case 'IDENTITY':
      return [briefing.identity];
    case 'KNOWS':
      return briefing.knows;
    case 'BELIEVES':
      return briefing.believes;
    case 'HIDING':
      return briefing.hiding;
    case 'GOAL':
      return [briefing.goal];
  }
}
