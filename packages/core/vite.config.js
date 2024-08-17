import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      exclude: ['**/__tests__/**/*'],
      entryRoot: '.',
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
      external: ['cross-fetch', 'lodash'],
    },
  },
});
