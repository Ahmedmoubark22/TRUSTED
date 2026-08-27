/**
 * The private briefing sequence, as approved:
 *
 *   PRIVATE notice → identity → you know → you believe → you are hiding
 *   → your goal → I'M READY → pass the phone
 *
 * `LOCKED` is the gate. While the step is LOCKED no briefing content is
 * reachable at all — not rendered-and-hidden, not fetched-and-unused. The
 * engine will not name the current character, so the UI has nothing to leak.
 *
 * `HANDOFF` is the pass screen. It is the only step from which the briefing
 * can move on to the next player, which is what stops one player from walking
 * into another player's content.
 */

export const BRIEFING_STEPS = [
  'LOCKED',
  'IDENTITY',
  'KNOWS',
  'BELIEVES',
  'HIDING',
  'GOAL',
  'HANDOFF',
] as const;

export type BriefingStep = (typeof BRIEFING_STEPS)[number];

/** The steps that actually show authored private content. */
export const BRIEFING_SECTIONS = ['IDENTITY', 'KNOWS', 'BELIEVES', 'HIDING', 'GOAL'] as const;

export type BriefingSection = (typeof BRIEFING_SECTIONS)[number];

export const SECTION_LABELS: Record<BriefingSection, string> = {
  IDENTITY: 'You are',
  KNOWS: 'You know',
  BELIEVES: 'You believe',
  HIDING: 'You are hiding',
  GOAL: 'Your goal',
};

/** The label on the button that advances *to* each step. */
export const ADVANCE_LABELS: Record<BriefingSection, string> = {
  IDENTITY: 'Begin',
  KNOWS: 'What you know',
  BELIEVES: 'What you believe',
  HIDING: 'What you are hiding',
  GOAL: 'Your goal',
};

export function isBriefingStep(value: unknown): value is BriefingStep {
  return typeof value === 'string' && (BRIEFING_STEPS as readonly string[]).includes(value);
}

export function isBriefingSection(step: BriefingStep): step is BriefingSection {
  return (BRIEFING_SECTIONS as readonly string[]).includes(step);
}

/** The next step in the sequence, or null at the end. */
export function nextBriefingStep(step: BriefingStep): BriefingStep | null {
  const index = BRIEFING_STEPS.indexOf(step);
  return BRIEFING_STEPS[index + 1] ?? null;
}

/**
 * The sections revealed so far. Content accumulates within one player's
 * briefing so they can re-read it before passing the phone on — they have to
 * hold all of it in their head once the device leaves their hands.
 */
export function visibleSections(step: BriefingStep): BriefingSection[] {
  if (step === 'LOCKED') return [];
  const limit = step === 'HANDOFF' ? BRIEFING_SECTIONS.length : BRIEFING_SECTIONS.indexOf(step) + 1;
  return BRIEFING_SECTIONS.slice(0, limit);
}
