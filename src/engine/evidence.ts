/**
 * The evidence sequence, as approved:
 *
 *   table → object arrives sealed → tap to uncover it, fragment by fragment
 *   → PUT IT ON THE TABLE → discussion → the next object
 *
 * The four conceptual states an object moves through:
 *
 *   UNDISCOVERED  the table does not know it exists
 *   AVAILABLE     it is the object in front of them, still sealed
 *   INSPECTING    it is open and being read
 *   ON_TABLE      it has been placed; everyone owns it now
 *
 * None of that is stored. All four are derived from two facts the state
 * already holds — which objects have been placed (`revealedEvidence`) and how
 * far the current one has been uncovered (`evidenceRevealed`) — plus the
 * `requires` chain the case author wrote. One number and one list is the
 * whole model.
 *
 * The important consequence is UNDISCOVERED. Because "which object is next" is
 * computed from the placed list, an object that has not been reached is never
 * named, never fetched and never handed to a component. There is nothing on
 * screen to hide.
 */

import type { EvidenceDefinition, EvidenceId } from '../content/types';

export const EVIDENCE_STATES = ['UNDISCOVERED', 'AVAILABLE', 'INSPECTING', 'ON_TABLE'] as const;

export type EvidenceState = (typeof EVIDENCE_STATES)[number];

/** Nothing uncovered. The object is sealed. */
export const SEALED = 0;

/**
 * The next object in the authored chain, or undefined when the table has
 * placed everything.
 *
 * Returns an id rather than a definition on purpose — the same reason
 * `revealableCharacterId` does. A caller that ignores the phase rules still
 * cannot get contents out of it.
 */
export function nextEvidenceId(
  evidence: readonly EvidenceDefinition[],
  placed: readonly EvidenceId[],
): EvidenceId | undefined {
  return evidence.find(
    (item) => !placed.includes(item.id) && item.requires.every((id) => placed.includes(id)),
  )?.id;
}

/** How many fragments of an object may be shown, given how far it is uncovered. */
export function visibleFragmentCount(item: EvidenceDefinition, revealed: number): number {
  return Math.max(0, Math.min(revealed, item.fragments.length));
}

export function isFullyUncovered(item: EvidenceDefinition, revealed: number): boolean {
  return revealed >= item.fragments.length;
}

/** The label on the tap target that uncovers the next fragment. */
export const OPEN_LABELS: Record<string, string> = {
  invitation: 'Open the card',
  photograph: 'Look closer',
  letter: 'Unfold the page',
};

export const CONTINUE_LABELS: Record<string, string> = {
  invitation: 'Turn it over',
  photograph: 'Turn it over',
  letter: 'Read on',
};
