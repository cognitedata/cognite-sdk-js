import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests use runTestWithRetryWhenFailing which retries up to
    // 15 times with exponential backoff — give each test enough room.
    testTimeout: 3 * 60 * 1000,
    hookTimeout: 60 * 1000,
  },
});
