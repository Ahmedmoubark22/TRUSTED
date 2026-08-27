import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../src/app/App';
import { GameProvider } from '../src/app/GameProvider';
import { createDevGame } from '../src/app/dev/devSeed';
import { GAME_PHASES, PHASE_META } from '../src/engine/phases';

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
