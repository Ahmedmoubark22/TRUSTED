import { CASE_001 } from '../src/content/cases/case-001';
import type { CharacterId, EvidenceDefinition } from '../src/content/types';
import { getCase } from '../src/content/registry';
import { nextEvidenceId } from '../src/engine/evidence';
import { votableCharacterIds } from '../src/engine/selectors';
import type { GameEvent } from '../src/engine/events';
import { createInitialState } from '../src/engine/initialState';
import { reduce } from '../src/engine/reducer';
import type { EngineContext, GameState } from '../src/engine/types';

/**
 * Deterministic context: fixed clock, fixed RNG, counted session ids, real
 * case content. Ids are sequential rather than random so a test can assert
 * that two games really did get different sessions.
 */
let sessionCounter = 0;

export function resetSessionCounter(): void {
  sessionCounter = 0;
}

export const ctx: EngineContext = {
  now: () => 1_000,
  random: () => 0.42,
  newSessionId: () => `session-${(sessionCounter += 1)}`,
  getCase,
};

export function run(state: GameState, ...events: GameEvent[]): GameState {
  return events.reduce((s, e) => reduce(s, e, ctx), state);
}

/** A game seated and dealt, parked at the first player's closed briefing gate. */
export function seatedGame(playerCount = CASE_001.minPlayers): GameState {
  return run(
    createInitialState(),
    { type: 'SELECT_CASE', caseId: CASE_001.id },
    { type: 'INTRO_COMPLETE' },
    { type: 'SET_PLAYER_COUNT', count: playerCount },
    { type: 'CONFIRM_PLAYERS' },
    { type: 'DEAL_CHARACTERS' },
    { type: 'CONFIRM_ASSIGNMENTS' },
  );
}

/**
 * Open the gate and read every section, stopping on the pass screen.
 * Mirrors what a real player's taps do — no state is set directly.
 */
export function readBriefing(state: GameState): GameState {
  let next = run(state, { type: 'UNLOCK_BRIEFING' });
  let guard = 0;
  while (next.briefingStep !== 'HANDOFF') {
    next = run(next, { type: 'ADVANCE_BRIEFING_STEP' });
    if ((guard += 1) > 10) throw new Error('briefing never reached the pass screen');
  }
  return next;
}

/** Read the current briefing, then hand the device to the next player. */
export function briefOnePlayer(state: GameState): GameState {
  return run(readBriefing(state), { type: 'ADVANCE_BRIEFING' });
}

/** Brief everyone in seat order. Ends at TABLE. */
export function briefAllPlayers(state: GameState): GameState {
  let next = state;
  for (let i = 0; i < state.players.length; i += 1) next = briefOnePlayer(next);
  return next;
}

/** The object the table would be handed next, straight from the authored chain. */
export function activeEvidence(state: GameState): EvidenceDefinition {
  const id = nextEvidenceId(CASE_001.evidence, state.revealedEvidence);
  const item = CASE_001.evidence.find((e) => e.id === id);
  if (!item) throw new Error('no evidence left in the chain');
  return item;
}

/**
 * Tap through every fragment of the object in front of the table.
 * Mirrors real taps — no state is set directly.
 */
export function inspectEvidence(state: GameState): GameState {
  const item = activeEvidence(state);
  let next = state;
  for (let i = 0; i < item.fragments.length; i += 1) {
    next = run(next, { type: 'INSPECT_EVIDENCE', evidenceId: item.id });
  }
  return next;
}

/** Open, read and place the next object. TABLE or DISCUSSION in, DISCUSSION out. */
export function placeNextEvidence(state: GameState): GameState {
  const opened = state.phase === 'EVIDENCE' ? state : run(state, { type: 'OPEN_EVIDENCE' });
  const read = inspectEvidence(opened);
  return run(read, { type: 'PLACE_EVIDENCE', evidenceId: activeEvidence(read).id });
}

/**
 * Play the whole authored evidence loop the way a table would: object,
 * discussion, object, discussion… Ends at DECISION_READY.
 */
export function playAllEvidence(state: GameState): GameState {
  let next = state;
  let guard = 0;
  while (next.phase !== 'DECISION_READY') {
    next = run(placeNextEvidence(next), { type: 'DISCUSSION_COMPLETE' });
    if ((guard += 1) > 20) throw new Error('evidence loop never reached the decision');
  }
  return next;
}

/** A briefed table that has worked through every object. Ends at DECISION_READY. */
export function atDecision(): GameState {
  return playAllEvidence(briefAllPlayers(seatedGame()));
}

/** …and has started voting, parked at the first player's closed gate. */
export function atVoting(): GameState {
  return run(atDecision(), { type: 'START_VOTING' });
}

/** The character a given seat was dealt. */
export function characterOf(state: GameState, seat: number): CharacterId {
  const player = state.players[seat];
  const characterId = player && state.assignments[player.id];
  if (!characterId) throw new Error(`no character dealt to seat ${seat}`);
  return characterId;
}

/**
 * Open the gate and lock in the current voter's choice.
 * Mirrors what a real player's taps do — no state is set directly.
 */
export function castVote(state: GameState, targetCharacterId: CharacterId): GameState {
  const voter = state.players[state.voteCursor];
  if (!voter) throw new Error('nobody is holding the device');
  return run(
    state,
    { type: 'UNLOCK_VOTE' },
    { type: 'CAST_VOTE', voterId: voter.id, targetCharacterId },
  );
}

/**
 * Everyone votes, in seat order. `pick` is given the seat and the characters
 * that seat is actually allowed to name.
 */
export function voteAll(
  state: GameState,
  pick: (seat: number, options: CharacterId[]) => CharacterId,
): GameState {
  let next = state;
  for (let seat = 0; seat < state.players.length; seat += 1) {
    const voter = next.players[next.voteCursor];
    if (!voter) throw new Error('ran out of voters');
    const options = votableCharacterIds(next, CASE_001, voter.id);
    next = castVote(next, pick(seat, options));
  }
  return next;
}

/** Read every vote out until the result is on screen. */
export function readOutVotes(state: GameState): GameState {
  let next = state;
  for (let i = 0; i < state.players.length; i += 1) {
    next = run(next, { type: 'ADVANCE_VOTE_REVEAL' });
  }
  return next;
}
