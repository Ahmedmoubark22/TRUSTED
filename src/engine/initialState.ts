import type { GameState, Player, PlayerId } from './types';
import { SCHEMA_VERSION } from './types';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

/** Default seat labels until players type their own names. */
const DEFAULT_NAMES = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'];

export function makePlayerId(seat: number): PlayerId {
  return `p${seat + 1}`;
}

export function makePlayer(seat: number, name?: string): Player {
  return {
    id: makePlayerId(seat),
    name: name ?? DEFAULT_NAMES[seat] ?? `Player ${seat + 1}`,
    seat,
  };
}

export function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, seat) => makePlayer(seat));
}

export function createInitialState(): GameState {
  return {
    schemaVersion: SCHEMA_VERSION,
    phase: 'HOME',
    caseId: null,
    players: [],
    assignments: {},
    briefingCursor: 0,
    briefingStep: 'LOCKED',
    briefingResumed: false,
    revealedEvidence: [],
    evidenceRevealed: 0,
    voteCursor: 0,
    voteStep: 'LOCKED',
    voteResumed: false,
    votes: {},
    revoteCandidates: [],
    voteRevealStep: 0,
    revealBeat: 0,
    createdAt: null,
    updatedAt: null,
  };
}
