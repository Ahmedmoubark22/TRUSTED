/**
 * A minimal, failure-tolerant wrapper over Web Storage.
 *
 * Storage throws in private-browsing modes and when quota is exceeded, and it
 * does not exist at all during server-side rendering or in the test runner —
 * so every call here degrades to a no-op instead of taking the app down.
 */

export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

/** In-memory fallback: keeps the app working when storage is unavailable. */
export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
  };
}

function probe(storage: Storage): boolean {
  try {
    const probeKey = '__trusted_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function createLocalStore(): KeyValueStore {
  const storage = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;
  if (!storage || !probe(storage)) return createMemoryStore();

  return {
    get(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        /* quota or permission — drop the write rather than crash the game */
      }
    },
    remove(key) {
      try {
        storage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
