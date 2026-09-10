import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { createDevGame } from '../src/app/dev/devSeed';
import { GAME_PHASES, PHASE_META } from '../src/engine/phases';
import { CASES } from '../src/content/registry';

/**
 * Smoke test: every approved phase must render. Uses react-dom/server rather
 * than a DOM environment so no extra test dependency is needed.
 */
describe('phase views', () => {
  for (const phase of GAME_PHASES) {
    it(`renders ${phase}`, () => {
      const html = renderToString(
        <GameProvider initialState={createDevGame(phase)}>
          <App />
        </GameProvider>,
      );
      expect(html).toContain(PHASE_META[phase].title);
      expect(html).not.toContain('undefined');
    });
  }
});

/**
 * The shell bar and a view's own header are two different things, and on one
 * screen they were the same thing twice.
 *
 * HOME is the only phase where the view's hero says what the bar says — the
 * product name and its line — so the home screen printed both, one directly
 * above the other. Counting is the whole test: a page that names itself twice
 * is the bug, whichever half is removed to fix it.
 */
describe('the home screen', () => {
  const home = () =>
    renderToString(
      <GameProvider initialState={createDevGame('HOME')}>
        <App />
      </GameProvider>,
    );

  function occurrences(haystack: string, needle: string): number {
    return haystack.split(needle).length - 1;
  }

  it('names the product once, not twice', () => {
    expect(occurrences(home(), 'TRUSTED')).toBe(1);
  });

  it('says its line once, not twice', () => {
    expect(occurrences(home(), 'Everyone knows something')).toBe(1);
  });

  it('still says them at all', () => {
    const html = home();
    expect(html).toContain('TRUSTED');
    expect(html).toContain('Everyone knows something');
  });

  it('keeps the bar on every other phase', () => {
    for (const phase of GAME_PHASES.filter((p) => p !== 'HOME')) {
      const html = renderToString(
        <GameProvider initialState={createDevGame(phase)}>
          <App />
        </GameProvider>,
      );
      expect(html, phase).toContain('app__bar');
    }
  });
});

/**
 * A case authored for exactly four people was advertising "4–4 players".
 *
 * The range is the exception in this collection, not the format: briefings are
 * authored per character, so most cases are written for one exact number of
 * seats and printing `min–max` turned that into a stutter.
 */
describe('a case card', () => {
  const home = () =>
    renderToString(
      <GameProvider initialState={createDevGame('HOME')}>
        <App />
      </GameProvider>,
    );

  it('never prints a range where there is only one number', () => {
    const html = home();
    for (const def of CASES) {
      if (def.minPlayers !== def.maxPlayers) continue;
      expect(html, def.id).not.toContain(`${def.minPlayers}–${def.maxPlayers} players`);
      expect(html, def.id).toContain(`${def.minPlayers} players`);
    }
  });

  it('still prints a range for a case that has one', () => {
    // No such case is authored today; this keeps the branch honest if one is.
    const ranged = CASES.filter((c) => c.minPlayers !== c.maxPlayers);
    const html = home();
    for (const def of ranged) {
      expect(html, def.id).toContain(`${def.minPlayers}–${def.maxPlayers} players`);
    }
  });
});
