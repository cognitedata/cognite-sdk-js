const path = require('path');
const snippetsFolder = path.join(__dirname, '../codeSnippets');
const jsonDoc = require(snippetsFolder + '/docs.json');
const _ = require('lodash');
const fs = require('fs');
const tsconfig = require('../tsconfig.build.json');

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

fs.writeFileSync(snippetsFolder + '/index.json', JSON.stringify(resultJson, null, 2) + '\n');
console.log('JS code snippets saved to: jsSnippets.json');

tsconfig.include = ['*.ts'];
tsconfig.compilerOptions.noUnusedLocals = false;

fs.writeFileSync(snippetsFolder + '/tsconfig.build.json', JSON.stringify(tsconfig, null, 2) + '\n');
console.log(`TS config for code snippets saved to: ${snippetsFolder}/tsconfig.build.json`);
