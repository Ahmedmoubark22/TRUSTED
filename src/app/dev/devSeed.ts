import { CASE_001 } from '../../content/cases/case-001';
import { createInitialState, makePlayer } from '../../engine/initialState';
import type { GamePhase } from '../../engine/phases';
import type { GameState, PlayerId } from '../../engine/types';

const DEV_NAMES = ['Ana', 'Ben', 'Cass', 'Dov', 'Eli', 'Fay'];

/** Player count for the seeded game. Case 001's slice is authored for four. */
const DEV_PLAYERS = 4;

/**
 * Builds a coherent 4-player game parked at any phase, so the whole approved
 * flow can be inspected without playing through it. Deterministic: no RNG, so
 * the same phase always looks the same.
 *
 * Every phase gets the state it would plausibly have arrived with — the dev
 * stepper must never drop you into a screen with missing prerequisites.
 */
export function createDevGame(phase: GamePhase, playerCount = DEV_PLAYERS): GameState {
  const base = createInitialState();
  if (phase === 'HOME') return base;

  const players = Array.from({ length: playerCount }, (_, seat) => makePlayer(seat, DEV_NAMES[seat]));

  const state: GameState = {
    ...base,
    phase,
    caseId: CASE_001.id,
    players,
    createdAt: 0,
    updatedAt: 0,
  };

  const needsRoles = phaseIsAtOrAfter(phase, 'PRIVATE_BRIEFINGS');
  if (needsRoles) {
    const assignments: Record<PlayerId, string> = {};
    players.forEach((player, i) => {
      const character = CASE_001.characters[i];
      if (character) assignments[player.id] = character.id;
    });
    state.assignments = assignments;
  }

  // At the table and beyond, assume the room has opened the starting evidence.
  if (phaseIsAtOrAfter(phase, 'TABLE')) {
    state.revealedEvidence = CASE_001.evidence.filter((e) => e.requires.length === 0).map((e) => e.id);
  }

  // From the vote reveal onward there must be a completed ballot.
  if (phaseIsAtOrAfter(phase, 'VOTE_REVEAL')) {
    const votes: Record<PlayerId, PlayerId> = {};
    players.forEach((player, i) => {
      // Everyone but the first voter accuses seat 3; enough for a clear result.
      const target = players[i === 0 ? 1 : 2] ?? players[0];
      if (target) votes[player.id] = target.id;
    });
    state.votes = votes;
  }

  return state;
}

const ORDER: readonly GamePhase[] = [
  'HOME',
  'CASE_INTRO',
  'PLAYER_SETUP',
  'CHARACTER_ASSIGNMENT',
  'PRIVATE_BRIEFINGS',
  'TABLE',
  'EVIDENCE',
  'DISCUSSION',
  'DECISION_READY',
  'VOTING',
  'VOTE_REVEAL',
  'TRUTH_REVEAL',
  'CASE_COMPLETE',
];

function phaseIsAtOrAfter(phase: GamePhase, marker: GamePhase): boolean {
  return ORDER.indexOf(phase) >= ORDER.indexOf(marker);
}
