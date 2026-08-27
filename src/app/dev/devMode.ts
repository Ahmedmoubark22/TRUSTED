/**
 * Dev/test mode is on during `npm run dev`, and can be forced on a production
 * build with `?dev=1` for device testing.
 */
export function isDevMode(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('dev');
}
