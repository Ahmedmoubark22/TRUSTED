/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Build-time opt-in for the dev bar in a *deployed* build.
   *
   * Absent everywhere by default, which is the point: the dev bar jumps game
   * state, so on production it is a cheat button. It is set to `"true"` only
   * on a preview environment, and Vite bakes the value in at build time — so
   * turning it on requires a rebuild by somebody with access to the build
   * environment, not a query string.
   */
  readonly VITE_ENABLE_DEV_BAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
