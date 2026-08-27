import type { GameEvent } from './events';
import { nextBriefingStep } from './briefing';
import { canTransition, type GamePhase } from './phases';
import { currentBriefingCharacterId } from './selectors';
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

export function reduce(state: GameState, event: GameEvent, ctx: EngineContext): GameState {
  switch (event.type) {
    case 'RESET':
      return createInitialState();

    case 'HYDRATE':
      return migrate(event.state);

    case 'SELECT_CASE': {
      const def = ctx.getCase(event.caseId);
      if (!def) return state;
      if (!canTransition(state.phase, 'CASE_INTRO')) return state;
      return {
        ...createInitialState(),
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

    case 'OPEN_EVIDENCE':
      return go(state, 'EVIDENCE', ctx);

    case 'REVEAL_EVIDENCE': {
      if (state.phase !== 'EVIDENCE') return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      const item = def?.evidence.find((e) => e.id === event.evidenceId);
      if (!item) return state;
      if (state.revealedEvidence.includes(item.id)) return state;
      // Content decides what is true, including what must come first.
      const unlocked = item.requires.every((id) => state.revealedEvidence.includes(id));
      if (!unlocked) return state;
      return touch({ ...state, revealedEvidence: [...state.revealedEvidence, item.id] }, ctx);
    }

    case 'CLOSE_EVIDENCE':
    case 'CLOSE_DISCUSSION':
    case 'RETURN_TO_TABLE':
      return go(state, 'TABLE', ctx);

    case 'OPEN_DISCUSSION':
      return go(state, 'DISCUSSION', ctx);

    case 'READY_TO_DECIDE':
      return go(state, 'DECISION_READY', ctx);

    case 'START_VOTING':
      return go(state, 'VOTING', ctx, { voteCursor: 0, votes: {} });

    case 'CAST_VOTE': {
      if (state.phase !== 'VOTING') return state;
      const voter = state.players.find((p) => p.id === event.voterId);
      const accused = state.players.find((p) => p.id === event.accusedId);
      if (!voter || !accused) return state;
      // Only the player whose turn it is may vote, and only once.
      if (state.players[state.voteCursor]?.id !== voter.id) return state;
      if (voter.id in state.votes) return state;
      const votes = { ...state.votes, [voter.id]: accused.id };
      const next = state.voteCursor + 1;
      if (next < state.players.length) {
        return touch({ ...state, votes, voteCursor: next }, ctx);
      }
      return go(state, 'VOTE_REVEAL', ctx, { votes, voteCursor: 0 });
    }

    case 'SHOW_TRUTH':
      return go(state, 'TRUTH_REVEAL', ctx, { revealBeat: 0 });

    case 'ADVANCE_TRUTH_BEAT': {
      if (state.phase !== 'TRUTH_REVEAL') return state;
      const def = state.caseId ? ctx.getCase(state.caseId) : undefined;
      const total = def?.truthBeats.length ?? 0;
      const next = state.revealBeat + 1;
      if (next < total) return touch({ ...state, revealBeat: next }, ctx);
      return go(state, 'CASE_COMPLETE', ctx);
    }

    case 'COMPLETE_CASE':
      return go(state, 'CASE_COMPLETE', ctx);

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
