module.exports = {
  name: 'Cognite JavaScript SDK',
  mode: 'file',
  module: 'umd',
  out: './docs/',
  readme: 'none',
  exclude: '**/*.test.ts',
  ignoreCompilerErrors: false,
  excludeNotExported: true,
  hideGenerator: true,
  target: 'ES6',
  excludePrivate: true,
  theme: 'markdown',
};
