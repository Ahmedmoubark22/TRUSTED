/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // host: true so a real phone on the same Wi-Fi can load the dev server.
    // (This is dev-time convenience only — not the multiplayer feature.)
    host: true,
    port: 5173,
  },
  test: {
    // The engine is pure and the render smoke test uses react-dom/server,
    // so no DOM environment (and no extra dependency) is required.
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
