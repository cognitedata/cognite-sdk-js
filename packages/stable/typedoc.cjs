/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  name: 'Cognite JavaScript SDK',
  exclude: ['**/__tests__/**', '**/node_modules/**'],
  out: './docs/',
  readme: 'README.md',
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  excludeExternals: false,
  plugin: ['typedoc-plugin-missing-exports'],
};
