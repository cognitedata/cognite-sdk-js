module.exports = {
  name: 'Cognite JavaScript SDK',
  mode: 'file',
  module: 'umd',
  target: 'ES6',
  exclude: [
    '**/__tests__/**',
    '**/base/**'
  ],
  out: './docs/',
  // theme: 'markdown',
  readme: 'none',
  ignoreCompilerErrors: true,
  excludeNotExported: true,
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  includeDeclarations: true,
  excludeExternals: true,
};
