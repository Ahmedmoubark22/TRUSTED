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

  // Evidence, seeded to whatever each phase plausibly arrived with. TABLE and
  // EVIDENCE start empty so the first object is genuinely still sealed;
  // DISCUSSION needs one placed object to be talking about; by the decision
  // there is nothing left to bring out.
  if (phase === 'DISCUSSION') {
    const first = CASE_001.evidence[0];
    if (first) state.revealedEvidence = [first.id];
  } else if (phaseIsAtOrAfter(phase, 'DECISION_READY')) {
    state.revealedEvidence = CASE_001.evidence.map((e) => e.id);
  }

  // From the vote reveal onward there must be a completed ballot. Votes name
  // characters, and nobody may name themselves — so seat 0 names the second
  // character and everyone else names the third, giving a clear winner.
  if (phaseIsAtOrAfter(phase, 'VOTE_REVEAL')) {
    const votes: Record<PlayerId, string> = {};
    players.forEach((player, i) => {
      const target = CASE_001.characters[i === 2 ? 1 : 2];
      if (target) votes[player.id] = target.id;
    });
    state.votes = votes;
    // Land on the finished reveal rather than mid-readout.
    state.voteRevealStep = players.length;
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
