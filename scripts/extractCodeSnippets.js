const path = require('node:path');
const snippetsFolder = path.join(process.cwd(), './codeSnippets');
const jsDoc = require(`${snippetsFolder}/docs.json`);
const _ = require('lodash');
const fs = require('node:fs');

function stripMarkdownCodeSnippet(rawCode) {
  return rawCode.replace('```js', '').replace('```', '').trim();
}

function findAllCodeSnippetsInJsDoc(jsDoc) {
  const codeSnippets = new Map(); // string => string[]
  _.cloneDeepWith(jsDoc, (value, _, object) => {
    const docRegEx =
      /https:\/\/(doc\.cognitedata\.com|docs\.cognite\.com|developer\.cognite\.com)\/api.*operation\/([a-zA-Z0-9]+)/g;
    while (true) {
      const matches = docRegEx.exec(value);
      if (!matches) {
        break;
      }
      const operationId = matches[2];
      const rawCode = object.text;
      if (!codeSnippets.has(operationId)) {
        codeSnippets.set(operationId, []);
      }
      codeSnippets.get(operationId).push(stripMarkdownCodeSnippet(rawCode));
    }
  });
  // comments appears two times in jsdoc...
  for (const operationId of codeSnippets.keys()) {
    codeSnippets.set(operationId, _.uniq(codeSnippets.get(operationId)));
  }
  return codeSnippets;
}

function joinSnippets(snippets) {
  return snippets.join('\n\n');
}

function writeCodeSnippetFile(codeSnippets, filepath) {
  const output = {
    language: 'JavaScript',
    label: 'JavaScript SDK',
    operations: {},
  };

  codeSnippets.forEach((snippets, operationId) => {
    output.operations[operationId] = joinSnippets(snippets);
  });
  fs.writeFileSync(filepath, `${JSON.stringify(output, null, 2)}\n`);
}

const packageName =
  process.argv.indexOf('--package-name') !== -1
    ? process.argv[process.argv.indexOf('--package-name') + 1]
    : '@cognite/sdk';

const codeSnippets = findAllCodeSnippetsInJsDoc(jsDoc);
const operationsWithHeader = ['redirectUrl'];
const jssnippetspath = path.join(snippetsFolder, '/index.json');
writeCodeSnippetFile(codeSnippets, jssnippetspath);
console.log(`JS code snippets saved to: ${jssnippetspath}`);

// write typescript file for syntax testing
codeSnippets.forEach((snippets, operationId) => {
  if (operationsWithHeader.indexOf(operationId) !== -1) {
    return;
  }
  const codeToTest = `
    import { CogniteClient, SequenceValueType } from '${packageName}';
    const client = new CogniteClient({
      appId: '[APP NAME]',
      project: '[PROJECT]',
      apiKeyMode: true,
      getToken: () => Promise.resolve('[API_KEY]'),
    });
    (async () => {
      ${joinSnippets(snippets)}
    })();
  `;
  fs.writeFileSync(path.join(snippetsFolder, `${operationId}.ts`), codeToTest);
});

const tsconfig = {};
tsconfig.include = ['*.ts'];
tsconfig.compilerOptions = {
  noUnusedLocals: false,
  outDir: 'dist',
  declaration: false,
  sourceMap: false,
};

// We make a tsconfig.build.json that extends the normal tsconfig.build.json
tsconfig.extends = '../../../tsconfig.build.json';
const tsbuildconfigpath = path.join(snippetsFolder, './tsconfig.build.json');
fs.writeFileSync(tsbuildconfigpath, `${JSON.stringify(tsconfig, null, 2)}\n`);
console.log(`TS build config for code snippets saved to: ${tsbuildconfigpath}`);
