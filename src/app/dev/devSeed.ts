import { CASE_001 } from '../../content/cases/case-001';
import { CASE_004 } from '../../content/cases/case-004';
import { getCulprits } from '../../content/culprits';
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
  // The two round phases only exist in an `interrogation` case, and Case 001
  // is not one. Seeding them off Case 001 would land the stepper on a screen
  // with nothing on it — so they get a real Case 004 game, mid-round.
  if (phase === 'INTERROGATION' || phase === 'ELIMINATION') return createDevRoundGame(phase);

  const players = Array.from({ length: playerCount }, (_, seat) => makePlayer(seat, DEV_NAMES[seat]));

  const state: GameState = {
    ...base,
    // Fixed rather than generated: a dev seed must look the same every time.
    sessionId: 'dev-session',
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
  // characters, and nobody may name themselves — so the room lands on the
  // character the case's truth actually points at, which is the interesting
  // case to inspect.
  if (phaseIsAtOrAfter(phase, 'VOTE_REVEAL')) {
    const answer = CASE_001.truth.immediateAnswerCharacterId;
    const fallback = CASE_001.characters.find((c) => c.id !== answer);
    const votes: Record<PlayerId, string> = {};
    players.forEach((player, i) => {
      // Whoever was dealt the answer has to name somebody else.
      const own = CASE_001.characters[i]?.id;
      votes[player.id] = own === answer ? (fallback?.id ?? answer) : answer;
    });
    state.votes = votes;
    // Land on the finished reveal rather than mid-readout.
    state.voteRevealStep = players.length;
  }

  return state;
}

/**
 * Case 004, parked in the middle of round two.
 *
 * Deliberately not round one: the interesting thing about this mode is what a
 * round costs, so the seed arrives with one name already struck off, that
 * player's seat already out of the vote, and the pool already one shorter.
 */
function createDevRoundGame(phase: 'INTERROGATION' | 'ELIMINATION'): GameState {
  const players = CASE_004.characters.map((_, seat) => makePlayer(seat, DEV_NAMES[seat]));
  const assignments: Record<PlayerId, string> = {};
  players.forEach((player, i) => {
    const character = CASE_004.characters[i];
    if (character) assignments[player.id] = character.id;
  });

  // Round one named ندى, who did not do it. She is cleared, her card has been
  // read, and her seat sits out round two.
  const cleared = ['nada'];
  const [first, second] = CASE_004.evidence;

  const state: GameState = {
    ...createInitialState(),
    sessionId: 'dev-session',
    phase,
    caseId: CASE_004.id,
    players,
    assignments,
    round: 2,
    totalRounds: CASE_004.rounds ?? 3,
    culprits: getCulprits(CASE_004.id),
    clearedCharacters: cleared,
    outcome: 'RUNNING',
    createdAt: 0,
    updatedAt: 0,
  };

  if (phase === 'INTERROGATION') {
    // Round two's object is down; the questions it raised are the screen.
    state.revealedEvidence = [first?.id, second?.id].filter((id): id is string => !!id);
    return state;
  }

  // ELIMINATION: round two has just named طارق, who also did not do it. His
  // card is open, which is the whole point of the screen.
  state.revealedEvidence = [first?.id, second?.id].filter((id): id is string => !!id);
  state.clearedCharacters = [...cleared, 'tarek'];
  state.lastEliminated = 'tarek';
  state.voteHistory = [{}];
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
  'INTERROGATION',
  'DECISION_READY',
  'VOTING',
  'VOTE_REVEAL',
  'ELIMINATION',
  'TRUTH_REVEAL',
  'CASE_COMPLETE',
];

function phaseIsAtOrAfter(phase: GamePhase, marker: GamePhase): boolean {
  return ORDER.indexOf(phase) >= ORDER.indexOf(marker);
}
