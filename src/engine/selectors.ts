import type {
  CaseDefinition,
  CharacterDefinition,
  CharacterId,
  EvidenceDefinition,
} from '../content/types';
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

export interface EvidenceCard {
  definition: EvidenceDefinition;
  isRevealed: boolean;
  /** False while its prerequisites are still hidden. */
  isUnlocked: boolean;
}

export function evidenceCards(state: GameState, def: CaseDefinition | undefined): EvidenceCard[] {
  if (!def) return [];
  return def.evidence.map((definition) => ({
    definition,
    isRevealed: state.revealedEvidence.includes(definition.id),
    isUnlocked: definition.requires.every((id) => state.revealedEvidence.includes(id)),
  }));
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
