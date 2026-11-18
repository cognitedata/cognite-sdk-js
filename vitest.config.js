import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    hookTimeout: 30_000,
    testTimeout: 25_000,
  },
});
