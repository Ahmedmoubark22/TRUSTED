import type { CaseDefinition, CharacterDefinition, EvidenceDefinition } from '../content/types';
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
export function culpritPlayer(state: GameState, def: CaseDefinition | undefined): Player | undefined {
  if (!def) return undefined;
  const entry = Object.entries(state.assignments).find(([, cid]) => cid === def.culpritCharacterId);
  if (!entry) return undefined;
  return playerById(state, entry[0]);
}

export function allVotesCast(state: GameState): boolean {
  return state.players.length > 0 && Object.keys(state.votes).length === state.players.length;
}
