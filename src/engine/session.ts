/**
 * Session identity.
 *
 * A *session* is one group's play-through of one case. It begins when a case
 * is opened and ends when the case closes or the table leaves it. Persisted
 * state belongs to a session, never to the browser at large — that is what
 * stops two groups on two devices, or two games on one device, from reading or
 * overwriting each other.
 *
 * This is local identity only. It is not an account, not a login, and not a
 * network session; nothing here is sent anywhere.
 */

export type SessionId = string;

/** Where a session's state lives. One key per session, never a shared one. */
export function sessionStorageKey(sessionId: SessionId): string {
  return `trusted:session:${sessionId}`;
}

/**
 * Which session this browser is currently in the middle of.
 *
 * Device-level, not game-level: it holds a pointer, never gameplay. Losing it
 * costs the table their place, not their privacy.
 */
export const ACTIVE_SESSION_KEY = 'trusted:active-session';

/**
 * The key the pre-session build wrote every game to. Kept only so the old
 * shared record can be cleared out; nothing ever reads it back.
 */
export const LEGACY_GAME_STATE_KEY = 'trusted.game';

/**
 * A new session id.
 *
 * `crypto.randomUUID` where it exists, and a timestamp-plus-entropy fallback
 * everywhere else, so an old browser gets a worse id rather than no game.
 * Injected through `EngineContext` so tests can make ids predictable.
 */
export function newSessionId(): SessionId {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `s-${Date.now().toString(36)}-${random}`;
}
