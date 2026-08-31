import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { configDefaults } from 'vitest/config';

const externals = ['@cognite/sdk-core', 'geojson', 'lodash'];

export default defineConfig({
  test: {
    // vitest's defaults (5s/10s) are too tight for the integration tests, which
    // wait on eventually consistent CDF endpoints. `vi.setConfig` cannot supply
    // these: it does not apply to a test that has already started, so calls from
    // `beforeAll` or from inside a test body are silently ignored. These are the
    // values vitest.workspace.js already declares, which the per-package test
    // runs (lerna runs vitest from each package directory) never pick up.
    testTimeout: 25_000,
    hookTimeout: 30_000,
  },
  plugins: [
    dts({
      exclude: ['**/__tests__/**/*', '**/*.spec.ts'],
      entryRoot: '.',
      aliasesExclude: externals,
      insertTypesEntry: true,
    }),
  ],
  build: {
    sourcemap: true,
    target: 'es6',
    lib: {
      formats: ['es', 'cjs'],
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: externals,
    },
  },
  test: {
    coverage: {
      exclude: [
        ...(configDefaults.coverage?.exclude || []),
        'src/api/dataPoints/proto/generated/**',
      ],
    },
  },
});
