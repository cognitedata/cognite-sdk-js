const jsonDoc = require('../docs.json');
const _ = require('lodash');
const fs = require('fs');

const docRegEx = /https:\/\/doc.cognitedata.com\/api\/v1\/#operation\/([a-zA-Z0-9]+)/g;
const header =
`import { CogniteClient } from '@cognite/sdk';\n
const client = new CogniteClient({ appId: '[APP NAME]' });
client.loginWithOAuth({
  project: '[PROJECT]'
});\n\n`;

const operationsWithoutHeader = ['redirectUrl'];

const lookupTable = {};
_.cloneDeepWith(jsonDoc, (value, _, object) => {
  let matches;
  
  while (matches = docRegEx.exec(value)) {
    const operationId = matches[1];
    const rawCode = object.text;
    let code = rawCode.replace('```js', '').replace('```', '').trim();
    if (operationsWithoutHeader.indexOf(operationId) < 0) {
      code = header + code;
    }
    lookupTable[operationId] = code;
  }
});

fs.writeFileSync('./jsSnippets.json', JSON.stringify(lookupTable, null, 2));

console.log('JS code snippets saved to: jsSnippets.json');
