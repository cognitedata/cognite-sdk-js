const jsonDoc = require('../a.json');
const _ = require('lodash');

const docRegEx = /https:\/\/doc.cognitedata.com\/api\/v1\/#operation\/([a-zA-Z0-9]+)/g;

const lookupTable = {};
_.cloneDeepWith(jsonDoc, (value, _, object) => {
  const matches = docRegEx.exec(value);
  if (matches) {
    const operationId = matches[1];
    const rawCode = object.text;
    const code = rawCode.replace('```js', '').replace('```', '').trim();
    lookupTable[operationId] = code;
  }
});

console.log(JSON.stringify(lookupTable, null, 2));