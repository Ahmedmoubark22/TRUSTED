/**
 * Whether the dev bar exists on this build.
 *
 * Two doors, and both are shut unless somebody with build access opened them:
 *
 *   - `npm run dev` locally, where `import.meta.env.DEV` is true;
 *   - a deployed build made with `VITE_ENABLE_DEV_BAR=true`.
 *
 * There is deliberately **no runtime door**. This used to also accept
 * `?dev=1` on any production build, which meant the phase jumper — a control
 * that rewrites game state to whatever you pick — was reachable on production
 * by anyone who guessed the query string. A preview build is a build, so
 * turning the tools on is a deploy, not a URL.
 */

/**
 * The gate itself, as a pure function of an environment.
 *
 * Split out from the call below so it can be tested against every combination
 * rather than only against whichever environment the test runner happens to
 * be in.
 */
export function devToolsEnabled(env: {
  DEV?: boolean;
  VITE_ENABLE_DEV_BAR?: string;
}): boolean {
  if (env.DEV === true) return true;
  // An exact match, so a stray "1", "yes" or "TRUE" left in a variable does
  // not quietly arm the tools on an environment nobody meant to open.
  return env.VITE_ENABLE_DEV_BAR === 'true';
}

export function isDevMode(): boolean {
  return devToolsEnabled(import.meta.env);
}
