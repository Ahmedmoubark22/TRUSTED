import type {
  CaseDefinition,
  CharacterDefinition,
  CharacterId,
  EvidenceDefinition,
  EvidenceFragment,
  EvidenceId,
} from '../content/types';
import {
  SEALED,
  isFullyUncovered,
  nextEvidenceId,
  visibleFragmentCount,
  type EvidenceState,
} from './evidence';
import type { GameState, Player, PlayerId } from './types';

/**
 * Read-only derivations of the authoritative state. Views use these instead of
 * recomputing gameplay facts locally.
 */

export function currentBriefingPlayer(state: GameState): Player | undefined {
  return state.players[state.briefingCursor];
}

export function currentVoter(state: GameState): Player | undefined {
  return state.players[state.voteCursor];
}

/**
 * The character dealt to whoever currently holds the device for briefing.
 * Says nothing about whether that briefing may be *shown* — see
 * `revealableCharacterId`.
 */
export function currentBriefingCharacterId(state: GameState): CharacterId | undefined {
  const player = currentBriefingPlayer(state);
  if (!player) return undefined;
  return state.assignments[player.id];
}

/**
 * The one character whose private briefing may be displayed right now, or
 * `undefined` if none may be.
 *
 * This is the privacy gate, and it lives in the engine on purpose. The UI
 * cannot decide to show a briefing; it can only ask which one it is allowed
 * to show, and gets nothing back unless:
 *
 *   - the game is actually in PRIVATE_BRIEFINGS,
 *   - the player at the device has explicitly opened the gate, and
 *   - they have not yet reached the pass screen.
 *
 * Because it returns an id rather than content, no secret can leak through
 * this call even if a caller ignores the result.
 */
export function revealableCharacterId(state: GameState): CharacterId | undefined {
  if (state.phase !== 'PRIVATE_BRIEFINGS') return undefined;
  if (state.briefingStep === 'LOCKED' || state.briefingStep === 'HANDOFF') return undefined;
  return currentBriefingCharacterId(state);
}

/** The player who will hold the device next, if anyone. */
export function nextBriefingPlayer(state: GameState): Player | undefined {
  return state.players[state.briefingCursor + 1];
}

export function characterFor(
  state: GameState,
  def: CaseDefinition | undefined,
  playerId: PlayerId,
): CharacterDefinition | undefined {
  const characterId = state.assignments[playerId];
  if (!def || !characterId) return undefined;
  return def.characters.find((c) => c.id === characterId);
}

export function playerById(state: GameState, playerId: PlayerId): Player | undefined {
  return state.players.find((p) => p.id === playerId);
}

/* ------------------------------------------------------------------ evidence */

/**
 * Whether the case still has an object the table has not reached.
 *
 * A boolean, on purpose. The table screen and the discussion screen both need
 * to know whether there is more to come, and neither of them is allowed to
 * know *what*. Returning a count would put "3" on a screen and tell the room
 * how much is still hidden; returning a definition would put its title one
 * property access from being rendered.
 */
export function hasUnplacedEvidence(
  state: GameState,
  def: CaseDefinition | undefined,
): boolean {
  if (!def) return false;
  return nextEvidenceId(def.evidence, state.revealedEvidence) !== undefined;
}

/**
 * The one object that may be shown right now, or undefined.
 *
 * This is the evidence counterpart of `revealableCharacterId`, and it exists
 * for the same reason: the UI cannot decide to show an object, it can only ask
 * which one it is allowed to show. Outside the EVIDENCE phase the answer is
 * always "none", so no view — however it is rendered — can paint an object the
 * table has not been handed.
 */
export function inspectableEvidence(
  state: GameState,
  def: CaseDefinition | undefined,
): EvidenceDefinition | undefined {
  if (state.phase !== 'EVIDENCE') return undefined;
  if (!def) return undefined;
  const id = nextEvidenceId(def.evidence, state.revealedEvidence);
  return def.evidence.find((e) => e.id === id);
}

/**
 * The fragments of the active object the table has actually uncovered.
 *
 * Sliced, not filtered-and-hidden. What has not been uncovered never reaches
 * the component, so it cannot end up in the DOM under a class name.
 */
export function visibleFragments(
  state: GameState,
  item: EvidenceDefinition | undefined,
): EvidenceFragment[] {
  if (!item) return [];
  return item.fragments.slice(0, visibleFragmentCount(item, state.evidenceRevealed));
}

/** True once the whole of the active object has been read. */
export function isEvidenceFullyInspected(
  state: GameState,
  item: EvidenceDefinition | undefined,
): boolean {
  if (!item) return false;
  return isFullyUncovered(item, state.evidenceRevealed);
}

/**
 * What is on the table, in the order it was placed.
 *
 * Only placed objects. This is the whole of what the shared view is allowed to
 * show, and it is built from the placed list rather than filtered out of the
 * full one — there is no complete list in scope to leak from.
 */
export function tableEvidence(
  state: GameState,
  def: CaseDefinition | undefined,
): EvidenceDefinition[] {
  if (!def) return [];
  return state.revealedEvidence
    .map((id) => def.evidence.find((e) => e.id === id))
    .filter((e): e is EvidenceDefinition => e !== undefined);
}

/** The object that started the conversation now happening. */
export function lastPlacedEvidence(
  state: GameState,
  def: CaseDefinition | undefined,
): EvidenceDefinition | undefined {
  return tableEvidence(state, def).at(-1);
}

/**
 * Where a given object stands. The full conceptual model, derived on demand.
 *
 * Takes an id and returns a state — never contents — so asking about an object
 * the table has not reached tells you `UNDISCOVERED` and nothing else.
 */
export function evidenceStateOf(
  state: GameState,
  def: CaseDefinition | undefined,
  evidenceId: EvidenceId,
): EvidenceState {
  if (state.revealedEvidence.includes(evidenceId)) return 'ON_TABLE';
  if (!def) return 'UNDISCOVERED';
  if (nextEvidenceId(def.evidence, state.revealedEvidence) !== evidenceId) return 'UNDISCOVERED';
  return state.evidenceRevealed > SEALED && state.phase === 'EVIDENCE' ? 'INSPECTING' : 'AVAILABLE';
}

export interface VoteTally {
  playerId: PlayerId;
  name: string;
  votes: number;
}

/** Vote counts per accused player, highest first. */
export function voteTally(state: GameState): VoteTally[] {
  const counts = new Map<PlayerId, number>();
  for (const accusedId of Object.values(state.votes)) {
    counts.set(accusedId, (counts.get(accusedId) ?? 0) + 1);
  }
  return state.players
    .map((p) => ({ playerId: p.id, name: p.name, votes: counts.get(p.id) ?? 0 }))
    .sort((a, b) => b.votes - a.votes);
}

/** The accused player(s) with the most votes. More than one means a tie. */
export function accusedPlayers(state: GameState): VoteTally[] {
  const tally = voteTally(state).filter((t) => t.votes > 0);
  const top = tally[0];
  if (!top) return [];
  return tally.filter((t) => t.votes === top.votes);
}

/** The player who was actually dealt the culprit's character, if any. */
export function culpritPlayer(
  state: GameState,
  def: CaseDefinition | undefined,
): Player | undefined {
  if (!def?.culpritCharacterId) return undefined;
  const culpritId = def.culpritCharacterId;
  const entry = Object.entries(state.assignments).find(([, cid]) => cid === culpritId);
  if (!entry) return undefined;
  return playerById(state, entry[0]);
}

export function allVotesCast(state: GameState): boolean {
  return state.players.length > 0 && Object.keys(state.votes).length === state.players.length;
}
