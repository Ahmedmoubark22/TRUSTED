import type { EvidenceDefinition } from '../content/types';
import { isAccusationPhase } from './accusation';
import type { GameEvent } from './events';
import { nextBriefingStep } from './briefing';
import { SEALED, isFullyUncovered, nextEvidenceId } from './evidence';
import { canTransition, type GamePhase } from './phases';
import {
  activeCharacterIds,
  currentBriefingCharacterId,
  currentVoter,
  voteOutcome,
  votableCharacterIds,
} from './selectors';
import { MAX_PLAYERS, MIN_PLAYERS, createInitialState, makePlayer, makePlayers } from './initialState';
import type { EngineContext, GameState } from './types';
import { migrate } from './validate';

/**
 * The engine — "Engine defines what can happen."
 *
 * `reduce` is a pure function of (state, event, ctx). Illegal moves are
 * no-ops that return the same state reference, so the UI can stay simple:
 * dispatch freely, and the engine decides whether anything happened.
 */
/** The closed-gate briefing fields. Applied whenever the device changes hands. */
const CLOSED_BRIEFING = { briefingStep: 'LOCKED', briefingResumed: false } as const;

/** The same, for the private vote. */
const CLOSED_VOTE = { voteStep: 'LOCKED', voteResumed: false } as const;

/**
 * What may be dispatched while a restored session is waiting to be picked up.
 *
 * The recovery gate is enforced here rather than only in the view, for the
 * same reason the briefing and vote gates are: a screen can be bypassed, the
 * reducer cannot. Until the table answers, the interrupted game accepts
 * nothing that could advance or alter it.
 */
const RECOVERY_EVENTS: ReadonlySet<GameEvent['type']> = new Set([
  'RESUME_SESSION',
  'RESTART_SESSION',
  'RESET',
  'HYDRATE',
]);

export function reduce(state: GameState, event: GameEvent, ctx: EngineContext): GameState {
  if (state.recoveryRequired && !RECOVERY_EVENTS.has(event.type)) return state;

  switch (event.type) {
    case 'RESET':
      return createInitialState();

    case 'HYDRATE':
      return migrate(event.state);

    case 'SELECT_CASE': {
      const def = ctx.getCase(event.caseId);
      if (!def) return state;
      if (!canTransition(state.phase, 'CASE_INTRO')) return state;
      // Opening a case *is* the start of a session, so this is the one place a
      // session id is minted. Built from a fresh initial state, so nothing
      // from a previous game can survive into this one.
      return {
        ...createInitialState(),
        sessionId: ctx.newSessionId(),
        phase: 'CASE_INTRO',
        caseId: def.id,
        players: makePlayers(def.minPlayers),
        createdAt: ctx.now(),
        updatedAt: ctx.now(),
      };
    }

    case 'RESUME_SESSION': {
      // Only ever clears the gate. Votes, cursors and progress are untouched.
      if (!state.recoveryRequired) return state;
      return touch({ ...state, recoveryRequired: false }, ctx);
    }

    case 'RESTART_SESSION': {
      if (!state.recoveryRequired) return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      // Without a case to go back to there is nothing to restart into.
      if (!def) return createInitialState();
      return {
        ...createInitialState(),
        sessionId: ctx.newSessionId(),
        phase: 'CASE_INTRO',
        caseId: def.id,
        players: makePlayers(def.minPlayers),
        createdAt: ctx.now(),
        updatedAt: ctx.now(),
      };
    }

    case 'BACK_TO_HOME':
      // Leaving a case discards it; there is no partial-case resume by design.
      if (!canTransition(state.phase, 'HOME')) return state;
      return createInitialState();

    case 'INTRO_COMPLETE':
      return go(state, 'PLAYER_SETUP', ctx);

    case 'ADD_PLAYER': {
      if (state.phase !== 'PLAYER_SETUP') return state;
      if (state.players.length >= MAX_PLAYERS) return state;
      const player = makePlayer(state.players.length, event.name);
      return touch({ ...state, players: [...state.players, player] }, ctx);
    }

    case 'REMOVE_PLAYER': {
      if (state.phase !== 'PLAYER_SETUP') return state;
      if (state.players.length <= MIN_PLAYERS) return state;
      const remaining = state.players.filter((p) => p.id !== event.playerId);
      if (remaining.length === state.players.length) return state;
      return touch({ ...state, players: reseat(remaining) }, ctx);
    }

    case 'RENAME_PLAYER': {
      if (state.phase !== 'PLAYER_SETUP') return state;
      const name = event.name.trim().slice(0, 24);
      const players = state.players.map((p) => (p.id === event.playerId ? { ...p, name } : p));
      return touch({ ...state, players }, ctx);
    }

    case 'SET_PLAYER_COUNT': {
      if (state.phase !== 'PLAYER_SETUP') return state;
      const count = clamp(event.count, MIN_PLAYERS, MAX_PLAYERS);
      if (count === state.players.length) return state;
      const players =
        count < state.players.length
          ? state.players.slice(0, count)
          : [
              ...state.players,
              ...Array.from({ length: count - state.players.length }, (_, i) =>
                makePlayer(state.players.length + i),
              ),
            ];
      return touch({ ...state, players: reseat(players) }, ctx);
    }

    case 'CONFIRM_PLAYERS': {
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      if (!def) return state;
      const n = state.players.length;
      if (n < Math.max(MIN_PLAYERS, def.minPlayers)) return state;
      if (n > Math.min(MAX_PLAYERS, def.maxPlayers)) return state;
      if (def.characters.length < n) return state;
      return go(state, 'CHARACTER_ASSIGNMENT', ctx);
    }

    case 'DEAL_CHARACTERS': {
      if (state.phase !== 'CHARACTER_ASSIGNMENT') return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      if (!def) return state;
      const pool = shuffle(
        def.characters.map((c) => c.id),
        ctx.random,
      );
      const assignments: Record<string, string> = {};
      state.players.forEach((player, i) => {
        const characterId = pool[i];
        if (characterId) assignments[player.id] = characterId;
      });
      if (Object.keys(assignments).length !== state.players.length) return state;
      return touch({ ...state, assignments }, ctx);
    }

    case 'CONFIRM_ASSIGNMENTS': {
      if (Object.keys(state.assignments).length !== state.players.length) return state;
      return go(state, 'PRIVATE_BRIEFINGS', ctx, { ...CLOSED_BRIEFING, briefingCursor: 0 });
    }

    case 'UNLOCK_BRIEFING': {
      if (state.phase !== 'PRIVATE_BRIEFINGS') return state;
      // Only the gate opens a briefing, and only from closed.
      if (state.briefingStep !== 'LOCKED') return state;
      if (!currentBriefingCharacterId(state)) return state;
      return touch({ ...state, briefingStep: 'IDENTITY', briefingResumed: false }, ctx);
    }

    case 'ADVANCE_BRIEFING_STEP': {
      if (state.phase !== 'PRIVATE_BRIEFINGS') return state;
      // LOCKED is not walked past — it must be opened deliberately.
      if (state.briefingStep === 'LOCKED') return state;
      const next = nextBriefingStep(state.briefingStep);
      if (!next) return state;
      return touch({ ...state, briefingStep: next }, ctx);
    }

    case 'ADVANCE_BRIEFING': {
      if (state.phase !== 'PRIVATE_BRIEFINGS') return state;
      // The pass screen is the only way through to the next player. Without
      // this, a stray dispatch mid-briefing would move the cursor while the
      // gate was still open — landing the next player inside live content.
      if (state.briefingStep !== 'HANDOFF') return state;
      const next = state.briefingCursor + 1;
      if (next < state.players.length) {
        return touch({ ...state, ...CLOSED_BRIEFING, briefingCursor: next }, ctx);
      }
      return go(state, 'TABLE', ctx, { ...CLOSED_BRIEFING, briefingCursor: 0 });
    }

    case 'OPEN_EVIDENCE': {
      // Nothing left to bring out means nothing to open.
      if (!activeEvidence(state, ctx)) return state;
      return go(state, 'EVIDENCE', ctx, { evidenceRevealed: SEALED });
    }

    case 'INSPECT_EVIDENCE': {
      if (state.phase !== 'EVIDENCE') return state;
      const item = activeEvidence(state, ctx);
      // Only the object actually in front of the table can be touched. A tap
      // naming anything else — stale, guessed, or replayed — does nothing.
      if (!item || item.id !== event.evidenceId) return state;
      if (isFullyUncovered(item, state.evidenceRevealed)) return state;
      // Uncovering is not placing. The table state is untouched here.
      return touch({ ...state, evidenceRevealed: state.evidenceRevealed + 1 }, ctx);
    }

    case 'PLACE_EVIDENCE': {
      if (state.phase !== 'EVIDENCE') return state;
      const item = activeEvidence(state, ctx);
      if (!item || item.id !== event.evidenceId) return state;
      // An object nobody has read cannot be put in front of everyone.
      if (!isFullyUncovered(item, state.evidenceRevealed)) return state;
      return go(state, 'DISCUSSION', ctx, {
        revealedEvidence: [...state.revealedEvidence, item.id],
        evidenceRevealed: SEALED,
      });
    }

    case 'DISCUSSION_COMPLETE': {
      if (state.phase !== 'DISCUSSION') return state;
      // The group decides when talk is over; what follows is not their call.
      if (!activeEvidence(state, ctx)) return go(state, 'DECISION_READY', ctx);
      return go(state, 'EVIDENCE', ctx, { evidenceRevealed: SEALED });
    }

    case 'CLOSE_EVIDENCE':
    case 'RETURN_TO_TABLE':
      // Backing out reseals whatever was half-open, so the object is picked up
      // fresh rather than resumed mid-read.
      return go(state, 'TABLE', ctx, { evidenceRevealed: SEALED });

    case 'OPEN_DISCUSSION':
      return go(state, 'DISCUSSION', ctx);

    case 'READY_TO_DECIDE':
      return go(state, 'DECISION_READY', ctx);

    case 'SET_ACCUSATION': {
      // Naming somebody belongs to the investigation. Not to a briefing, where
      // one player is alone with the phone and there is no "room" to speak;
      // and not to the decision or the vote, where the arguing is over.
      if (!isAccusationPhase(state.phase)) return state;
      // Only somebody actually in play can be accused. This reuses the same
      // notion of "a character in this game" the ballot is built from, so the
      // engine stays case-agnostic and no second list of suspects exists.
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      if (!activeCharacterIds(state, def).includes(event.characterId)) return state;
      // Re-accusing the same person changes nothing, and the store treats an
      // unchanged reference as "nothing happened".
      if (state.accusation === event.characterId) return state;
      // Deliberately the only field written. An accusation is not a vote.
      return touch({ ...state, accusation: event.characterId }, ctx);
    }

    case 'START_VOTING':
      // A fresh decision: no carried-over ballot, and not a revote.
      return go(state, 'VOTING', ctx, {
        ...CLOSED_VOTE,
        voteCursor: 0,
        votes: {},
        revoteCandidates: [],
        voteRevealStep: 0,
      });

    case 'UNLOCK_VOTE': {
      if (state.phase !== 'VOTING') return state;
      // Only the gate opens a ballot, and only from closed.
      if (state.voteStep !== 'LOCKED') return state;
      if (!currentVoter(state)) return state;
      return touch({ ...state, voteStep: 'VOTING', voteResumed: false }, ctx);
    }

    case 'CAST_VOTE': {
      if (state.phase !== 'VOTING') return state;
      // A vote can only be locked from behind an opened gate.
      if (state.voteStep !== 'VOTING') return state;
      const voter = state.players.find((p) => p.id === event.voterId);
      if (!voter) return state;
      // Only the player whose turn it is may vote, and only once.
      if (state.players[state.voteCursor]?.id !== voter.id) return state;
      if (voter.id in state.votes) return state;
      // The engine decides what is votable: not yourself, and in a revote only
      // the tied characters. An abstention has no target and fails here too.
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      if (!votableCharacterIds(state, def, voter.id).includes(event.targetCharacterId)) {
        return state;
      }
      const votes = { ...state.votes, [voter.id]: event.targetCharacterId };
      const next = state.voteCursor + 1;
      if (next < state.players.length) {
        // The gate shuts before the device moves, so the next player arrives
        // at a sealed screen rather than at the last player's ballot.
        return touch({ ...state, ...CLOSED_VOTE, votes, voteCursor: next }, ctx);
      }
      return go(state, 'VOTE_REVEAL', ctx, {
        ...CLOSED_VOTE,
        votes,
        voteCursor: 0,
        voteRevealStep: 0,
      });
    }

    case 'ADVANCE_VOTE_REVEAL': {
      if (state.phase !== 'VOTE_REVEAL') return state;
      if (state.voteRevealStep >= state.players.length) return state;
      return touch({ ...state, voteRevealStep: state.voteRevealStep + 1 }, ctx);
    }

    case 'START_REVOTE': {
      if (state.phase !== 'VOTE_REVEAL') return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      const outcome = voteOutcome(state, def);
      // Only an unbroken tie earns a revote, and `resolveVote` reports a
      // second tie as DEADLOCK — so this can never run twice.
      if (outcome.kind !== 'TIE') return state;
      return go(state, 'VOTING', ctx, {
        ...CLOSED_VOTE,
        revoteCandidates: outcome.characterIds,
        votes: {},
        voteCursor: 0,
        voteRevealStep: 0,
      });
    }

    case 'SHOW_TRUTH':
      return go(state, 'TRUTH_REVEAL', ctx, { revealStep: 0 });

    case 'ADVANCE_REVEAL': {
      if (state.phase !== 'TRUTH_REVEAL') return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      const total = def?.truth.facts.length ?? 0;
      const next = state.revealStep + 1;
      // Walking off the last truth is the only way the case closes, so the
      // room cannot reach the ending without having heard all of it.
      if (next < total) return touch({ ...state, revealStep: next }, ctx);
      return go(state, 'CASE_COMPLETE', ctx);
    }

    case 'DEV_JUMP_TO_PHASE':
      // Deliberately bypasses the transition table. Dev bar only.
      return touch({ ...state, phase: event.phase }, ctx);

    default:
      return assertNever(event);
  }
}

/**
 * Move to `to` if the transition table allows it, otherwise no-op.
 *
 * The rejection path must return the *same reference* — the store treats an
 * unchanged reference as "nothing happened" and skips both the persist write
 * and the subscriber notification. So the patch is applied only after the
 * transition is known to be legal.
 */
function go(
  state: GameState,
  to: GamePhase,
  ctx: EngineContext,
  patch?: Partial<GameState>,
): GameState {
  if (!canTransition(state.phase, to)) return state;
  return { ...state, ...patch, phase: to, updatedAt: ctx.now() };
}

function touch(state: GameState, ctx: EngineContext): GameState {
  return { ...state, updatedAt: ctx.now() };
}

/**
 * The object the table is working on, straight from the authored chain.
 *
 * Deliberately derived rather than stored: there is no field that could drift
 * out of step with what has actually been placed, and no way to point the
 * table at an object the case never made available.
 */
function activeEvidence(state: GameState, ctx: EngineContext): EvidenceDefinition | undefined {
  const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
  if (!def) return undefined;
  const id = nextEvidenceId(def.evidence, state.revealedEvidence);
  return def.evidence.find((e) => e.id === id);
}

function reseat(players: GameState['players']): GameState['players'] {
  return players.map((p, seat) => ({ ...p, seat }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Fisher–Yates using the injected RNG, so dealing is reproducible in tests. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = out[i] as T;
    const b = out[j] as T;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled game event: ${JSON.stringify(value)}`);
}
