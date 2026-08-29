import type {
  CaseDefinition,
  CharacterDefinition,
  CharacterId,
  EvidenceDefinition,
  EvidenceFragment,
  EvidenceId,
  TruthFact,
} from '../content/types';
import { isAccusationPhase } from './accusation';
import { factAt, interpretVote, isFinalStep, type TruthResult } from './truth';
import {
  SEALED,
  isFullyUncovered,
  nextEvidenceId,
  visibleFragmentCount,
  type EvidenceState,
} from './evidence';
import {
  resolveVote,
  tallyVotes,
  type Vote,
  type VoteCount,
  type VoteOutcome,
} from './voting';
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

/* -------------------------------------------------------------- accusation */

/**
 * Who the room is naming, or nobody.
 *
 * Public on purpose, and the exact opposite of `ballotOptions`: a vote is
 * sealed until every seat has spoken, whereas an accusation is the thing the
 * table is saying out loud. Any screen may show it at any time.
 *
 * It carries a character and nothing else — no reason, no accuser, no
 * history. There is deliberately nothing here that could expose what a player
 * privately knows, because the only thing recorded is the name that was said.
 */
export function accusedCharacter(
  state: GameState,
  def: CaseDefinition | undefined,
): CharacterDefinition | undefined {
  if (!def || !state.accusation) return undefined;
  return charactersByIds(def, [state.accusation])[0];
}

/**
 * Who the room may name right now, or nothing outside the investigation.
 *
 * Gated on the phase for the same reason `ballotOptions` is: a view cannot
 * decide for itself that naming is allowed, it can only ask. Unlike the
 * ballot there is no self-exclusion — the accusation belongs to the group, so
 * every character in play is nameable, including the one whose player is
 * arguing hardest that it is not them.
 */
export function accusableCharacters(
  state: GameState,
  def: CaseDefinition | undefined,
): CharacterDefinition[] {
  if (!isAccusationPhase(state.phase) || !def) return [];
  const ids = activeCharacterIds(state, def);
  return def.characters.filter((c) => ids.includes(c.id));
}

/* -------------------------------------------------------------------- vote */

/** The characters actually in play — those dealt to a seated player. */
export function activeCharacterIds(
  state: GameState,
  def: CaseDefinition | undefined,
): CharacterId[] {
  if (!def) return [];
  const dealt = new Set(Object.values(state.assignments));
  return def.characters.filter((c) => dealt.has(c.id)).map((c) => c.id);
}

/**
 * Who a given player is allowed to name.
 *
 * The two approved rules live here and only here: never yourself, and in a
 * revote only the tied characters. The reducer checks the submitted target
 * against this same list, so the UI cannot offer an option the engine would
 * refuse, and a hand-dispatched event cannot beat an option the UI hides.
 */
export function votableCharacterIds(
  state: GameState,
  def: CaseDefinition | undefined,
  voterId: PlayerId,
): CharacterId[] {
  const own = state.assignments[voterId];
  const pool =
    state.revoteCandidates.length > 0 ? state.revoteCandidates : activeCharacterIds(state, def);
  return pool.filter((id) => id !== own);
}

/**
 * The options to put in front of whoever is holding the device, or nothing.
 *
 * Gated on the phase *and* the gate, exactly like `revealableCharacterId`.
 * The pass screen therefore renders no ballot at all — there is nothing on it
 * to leave behind when the phone changes hands.
 */
export function ballotOptions(
  state: GameState,
  def: CaseDefinition | undefined,
): CharacterDefinition[] {
  if (state.phase !== 'VOTING' || state.voteStep !== 'VOTING' || !def) return [];
  const voter = currentVoter(state);
  if (!voter) return [];
  const votable = votableCharacterIds(state, def, voter.id);
  return def.characters.filter((c) => votable.includes(c.id));
}

/**
 * One entry per player, in seat order. Unsubmitted votes carry no target, so
 * a ballot in progress cannot be read out of this.
 */
export function ballot(state: GameState): Vote[] {
  return state.players.map((player) => {
    const target = state.votes[player.id];
    return {
      playerId: player.id,
      targetCharacterId: target ?? null,
      submitted: target !== undefined,
    };
  });
}

export function allVotesCast(state: GameState): boolean {
  return state.players.length > 0 && Object.keys(state.votes).length === state.players.length;
}

/** Counts per candidate, highest first. Derived — never authored anywhere. */
export function voteCounts(state: GameState, def: CaseDefinition | undefined): VoteCount[] {
  const candidates =
    state.revoteCandidates.length > 0 ? state.revoteCandidates : activeCharacterIds(state, def);
  return tallyVotes(state.votes, candidates);
}

/**
 * What the room decided. `PENDING` until every player has locked a vote, so
 * no partial result can reach a screen mid-round.
 */
export function voteOutcome(state: GameState, def: CaseDefinition | undefined): VoteOutcome {
  return resolveVote(voteCounts(state, def), {
    allVotesIn: allVotesCast(state),
    hasRevoted: state.revoteCandidates.length > 0,
  });
}

export interface VoteRevealLine {
  voter: CharacterDefinition | undefined;
  target: CharacterDefinition | undefined;
}

/**
 * The votes read out so far, in seat order.
 *
 * Sliced to `voteRevealStep`, not filtered — a vote that has not been reached
 * yet never reaches the component, so the sequence cannot be spoiled by
 * reading the DOM. Outside VOTE_REVEAL this is always empty, which is what
 * keeps every ballot sealed until the last one is in.
 */
export function voteRevealLines(
  state: GameState,
  def: CaseDefinition | undefined,
): VoteRevealLine[] {
  if (state.phase !== 'VOTE_REVEAL' || !def) return [];
  const find = (id: CharacterId | undefined) => def.characters.find((c) => c.id === id);
  return state.players.slice(0, state.voteRevealStep).map((player) => ({
    voter: find(state.assignments[player.id]),
    target: find(state.votes[player.id]),
  }));
}

/** True once every vote has been read out and the result may be shown. */
export function voteRevealComplete(state: GameState): boolean {
  return state.phase === 'VOTE_REVEAL' && state.voteRevealStep >= state.players.length;
}

export function charactersByIds(
  def: CaseDefinition | undefined,
  ids: readonly CharacterId[],
): CharacterDefinition[] {
  if (!def) return [];
  return def.characters.filter((c) => ids.includes(c.id));
}

/* ------------------------------------------------------------------- truth */

/**
 * The one truth on screen right now, or nothing.
 *
 * Returns a single fact rather than the list-so-far. Later truths are not
 * rendered-and-hidden; they never reach the component, so the reveal cannot
 * be read ahead of itself out of the DOM. Outside TRUTH_REVEAL the answer is
 * always nothing.
 */
export function currentTruthFact(
  state: GameState,
  def: CaseDefinition | undefined,
): TruthFact | undefined {
  if (state.phase !== 'TRUTH_REVEAL' || !def) return undefined;
  return factAt(def.truth, state.revealStep);
}

export interface RevealProgress {
  /** 1-based, for display. */
  step: number;
  total: number;
  isFinal: boolean;
}

export function revealProgress(
  state: GameState,
  def: CaseDefinition | undefined,
): RevealProgress {
  const total = def?.truth.facts.length ?? 0;
  return {
    step: Math.min(state.revealStep + 1, total),
    total,
    isFinal: def ? isFinalStep(def.truth, state.revealStep) : false,
  };
}

/**
 * What the room found, from its actual vote and the authored answer.
 *
 * Note what this cannot do: it reads the vote, it never writes it, and it has
 * no say in which truths get revealed.
 */
export function caseResult(state: GameState, def: CaseDefinition | undefined): TruthResult {
  if (!def) return 'MISSED_IMMEDIATE_TRUTH';
  return interpretVote(voteOutcome(state, def), def.truth);
}

/** The character the room settled on, if it settled on one. */
export function chosenCharacter(
  state: GameState,
  def: CaseDefinition | undefined,
): CharacterDefinition | undefined {
  const outcome = voteOutcome(state, def);
  if (outcome.kind !== 'DECIDED') return undefined;
  return charactersByIds(def, [outcome.characterId])[0];
}

/** The character the case says took the letter. */
export function immediateAnswerCharacter(
  def: CaseDefinition | undefined,
): CharacterDefinition | undefined {
  if (!def) return undefined;
  return charactersByIds(def, [def.truth.immediateAnswerCharacterId])[0];
}

/** Evidence a truth points back at — placed objects only, by construction. */
export function factEvidence(
  def: CaseDefinition | undefined,
  fact: TruthFact | undefined,
): EvidenceDefinition[] {
  if (!def || !fact) return [];
  return def.evidence.filter((e) => fact.relatedEvidenceIds.includes(e.id));
}
