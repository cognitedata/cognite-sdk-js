const path = require('path');
const snippetsFolder = path.join(process.cwd(), './codeSnippets');
const jsonDoc = require(snippetsFolder + '/docs.json');
const _ = require('lodash');
const fs = require('fs');

const docRegEx = /https:\/\/(doc.cognitedata.com|docs.cognite.com)\/api\/v1\/#operation\/([a-zA-Z0-9]+)/g;
const header =
`import { CogniteClient, SequenceValueType } from '@cognite/sdk';\n
const client = new CogniteClient({ appId: '[APP NAME]' });
client.loginWithApiKey({
  project: '[PROJECT]',
  apiKey: '[API_KEY]'
});\n\n
(async () => {\n`;
const footer = '\n})();';

const operationsWithHeader = ['redirectUrl'];

const resultJson = {
  language: "JavaScript",
  label: "JavaScript SDK",
  operations: {}
};
_.cloneDeepWith(jsonDoc, (value, _, object) => {
  let matches;
  
  while (matches = docRegEx.exec(value)) {
    const operationId = matches[2];
    const rawCode = object.text;
    let code = rawCode.replace('```js', '').replace('```', '').trim();
    let codeToTest = code;
    if (operationsWithHeader.indexOf(operationId) < 0) {
      codeToTest = header + code + footer;
    }
    fs.writeFileSync(`${snippetsFolder}/${operationId}.ts`, codeToTest);
    resultJson.operations[operationId] = code;
  }
});

const jssnippetspath = path.join(snippetsFolder, './index.json');
fs.writeFileSync(jssnippetspath, JSON.stringify(resultJson, null, 2) + '\n');
console.log(`JS code snippets saved to: ${jssnippetspath}`);

const tsconfig = {};
tsconfig.include = ['*.ts'];
tsconfig.compilerOptions = {
  noUnusedLocals: false,
  outDir: "dist",
  declaration: false,
  sourceMap: false
};
tsconfig.extends = '../../../tsconfig.build.json';

const tsconfigpath = path.join(snippetsFolder, './tsconfig.json');
fs.writeFileSync(tsconfigpath, JSON.stringify(tsconfig, null, 2) + '\n');
console.log(`TS config for code snippets saved to: ${tsconfigpath}`);
