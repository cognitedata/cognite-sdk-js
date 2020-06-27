module.exports = {
  name: 'Cognite JavaScript SDK',
  mode: 'file',
  module: 'umd',
  target: 'ES6',
  exclude: [
    '**/__tests__/**',
    '**/node_modules/**'
  ],
  out: './docs/',
  // theme: 'markdown',
  readme: 'docs_index.md',
  ignoreCompilerErrors: true,
  excludeNotExported: true,
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  includeDeclarations: true,
  excludeExternals: false
};
