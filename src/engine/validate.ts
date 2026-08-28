import { isBriefingStep } from './briefing';
import { isPhase } from './phases';
import { isVoteStep } from './voting';
import type { GameState, Player } from './types';
import { SCHEMA_VERSION } from './types';
import { createInitialState } from './initialState';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.seat === 'number'
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((v) => typeof v === 'string');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Structural check for state coming from outside the running app (localStorage,
 * a dev seed, a future import). Anything that fails is discarded rather than
 * trusted — a half-valid game state is worse than a fresh one.
 */
export function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === SCHEMA_VERSION &&
    isPhase(value.phase) &&
    (value.caseId === null || typeof value.caseId === 'string') &&
    Array.isArray(value.players) &&
    value.players.every(isPlayer) &&
    isStringRecord(value.assignments) &&
    typeof value.briefingCursor === 'number' &&
    isBriefingStep(value.briefingStep) &&
    typeof value.briefingResumed === 'boolean' &&
    isStringArray(value.revealedEvidence) &&
    typeof value.evidenceRevealed === 'number' &&
    typeof value.voteCursor === 'number' &&
    isVoteStep(value.voteStep) &&
    typeof value.voteResumed === 'boolean' &&
    isStringRecord(value.votes) &&
    isStringArray(value.revoteCandidates) &&
    typeof value.voteRevealStep === 'number' &&
    typeof value.revealStep === 'number' &&
    (value.createdAt === null || typeof value.createdAt === 'number') &&
    (value.updatedAt === null || typeof value.updatedAt === 'number')
  );
}

/**
 * Migration seam. Older persisted payloads get upgraded here; anything we
 * cannot upgrade falls back to a fresh state. Today there is only version 1,
 * so this is deliberately thin — but the call site exists.
 */
export function migrate(value: unknown): GameState {
  if (isGameState(value)) return value;
  return createInitialState();
}
