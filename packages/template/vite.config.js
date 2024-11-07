import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const externals = ['@cognite/sdk', '@cognite/sdk-core'];

export default defineConfig({
  plugins: [
    dts({
      exclude: ['**/__tests__/**/*'],
      entryRoot: '.',
      aliasesExclude: externals,
    }),
  ],
  build: {
    sourcemap: true,
    target: 'es6',
    lib: {
      formats: ['es'],
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
});