import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: 'src/cdp.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
      clean: true,
    }),
  ],
};
