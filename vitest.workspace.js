import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/*',
  {
    test: {
      hookTimeout: 30_000,
      testTimeout: 25_000,
    },
  },
]);
