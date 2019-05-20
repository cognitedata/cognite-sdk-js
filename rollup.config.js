import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.ts',
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
    json({
      // All JSON files will be parsed by default,
      // but you can also specifically include/exclude files
      include: './package.json',

      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: false, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  ',

      // ignores indent and generates the smallest code
      compact: true, // Default: false

      // generate a named export for every property of the JSON object
      namedExports: true // Default: true
    }),
    typescript({
      typescript: require('typescript'),
      clean: true,
      exclude: '**/__tests__/**',
    }),
  ],
};
