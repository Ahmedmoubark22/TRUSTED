import { describe, expect, it } from 'vitest';
import { devToolsEnabled, isDevMode } from '../src/app/dev/devMode';

/**
 * The dev bar rewrites game state to whatever phase you pick. On production
 * that is a cheat button, so the gate in front of it is worth a test each way
 * rather than only the way that happens to be true in the test runner.
 */
describe('the dev tools gate', () => {
  it('is open on a local dev server', () => {
    expect(devToolsEnabled({ DEV: true })).toBe(true);
  });

  it('is open on a build that opted in', () => {
    expect(devToolsEnabled({ DEV: false, VITE_ENABLE_DEV_BAR: 'true' })).toBe(true);
  });

  it('is shut on a build that said nothing', () => {
    expect(devToolsEnabled({ DEV: false })).toBe(false);
    expect(devToolsEnabled({})).toBe(false);
  });

  it('is shut on a build that said no', () => {
    expect(devToolsEnabled({ DEV: false, VITE_ENABLE_DEV_BAR: 'false' })).toBe(false);
  });

  it('is not opened by a value that only looks like yes', () => {
    // A leftover "1" or "yes" in a variable must not quietly arm production.
    for (const value of ['1', 'yes', 'TRUE', 'True', 'on', '']) {
      expect(devToolsEnabled({ DEV: false, VITE_ENABLE_DEV_BAR: value }), value).toBe(false);
    }
  });

  it('has no runtime door left', () => {
    // The gate takes an environment and nothing else. `?dev=1` used to open it
    // on any production build; there is deliberately no argument, global or
    // query string that can reach it now.
    expect(devToolsEnabled.length).toBe(1);
    expect(String(devToolsEnabled)).not.toContain('location');
    expect(String(devToolsEnabled)).not.toContain('URLSearchParams');
  });

  it('reads the real environment, and is on under the test runner', () => {
    expect(isDevMode()).toBe(true);
  });
});
