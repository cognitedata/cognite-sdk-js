module.exports = {

  name: 'Cognite JavaScript SDK',
  mode: 'file',
  module: 'umd',
  target: 'ES6',
  exclude: ['**/__tests__/**', '**/node_modules/**'],
  out: './docs/',
  readme: 'README.md',
  ignoreCompilerErrors: true,
  excludeNotExported: false,
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  includeDeclarations: true,
  excludeExternals: false,
};
