const fs = require('fs');
const ls = require('ls');
const SwaggerParser = require('swagger-parser');

function getSchema(openApi, schemaName) {
  return openApi.components.schemas[schemaName];
}

function createSimpleJsDocComment(comment) {
  return [
    '/**',
    ` * ${comment}`,
    ` */`
  ];
}

function createPropertyDeclaration(name, schema) {
  const metadata = schema.properties[name];

  const createType = (name, value, required) => {
    return required ? `${name}: ${value};` : `${name}?: ${value};`;
  };
  let type;
  switch (metadata.type) {
    case 'integer': {
      type = createType(name, 'number');
      break;
    }

    case 'string': {
      type = createType(name, 'string');
      break;
    }

    case 'array': {
      if (metadata.items.type === 'integer')
        type = createType(name, 'number[]');
      else if (metadata.items.type === 'string')
        type = createType(name, 'string[]');
      break;
    }

    case 'object': {
      if (name === 'metadata')
        type = createType(name, '{ [key: string]: string }');
      else
        type = createType(name, 'object');
      break;
    }

    default:
      throw Error(`Unknown type ${metadata.type}`);
  }
  return [
    ...createSimpleJsDocComment(metadata.description),
    type
  ];
}

function getIndentCount(line) {
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== ' ') {
      return i;
    }
  }
  return 0;
}

function indent(lines, count) {
  const result = [];
  lines.forEach(line => {
    result.push(line.padStart(line.length + count, ' '));
  });
  return result;
}

function indexOf(arr, regEx, fromIndex) {
  for (let i = fromIndex; i < arr.length; i++) {
    if (regEx.test(arr[i])) {
      return i;
    }
  }
  return null;
}

function getNextBlock(templateLined) {
  const startIndex = indexOf(templateLined, /\/\/ cog:START/, 0);
  if (startIndex == null) return null;
  const schemaName = templateLined[startIndex].match(/\/\/ cog:START (.*)$/)[1];
  const endIndex = indexOf(templateLined, new RegExp(`// cog:END ${schemaName}`), startIndex + 1);
  if (endIndex == null) throw Error(`Missing close tag for ${schemaName}`);
  return { startIndex, endIndex, schemaName };
}

function replaceDescription(lines, description) {
  const result = [...lines];
  const regEx = /\/\/ cog:DESCRIPTION$/;
  let index = indexOf(result, regEx, 0);
  while (index != null) {
    result.splice(index, 1, ...createSimpleJsDocComment(description)); 
    index = indexOf(result, regEx, 0);
  }
  return result;
}

function replaceProperties(lines, schema) {
  const getList = (line, regEx) => {
    return line.match(regEx)[1].split(', ');
  };
  const result = [...lines];
  const insertLineIndex = indexOf(result, /\/\/ cog:INSERT /, 0);
  if (insertLineIndex == null) return result;
  const indentCount = getIndentCount(result[insertLineIndex]);
  propertiesToInsert =  getList(result[insertLineIndex], /\/\/ cog:INSERT (.*)$/);
  const skipLineIndex = indexOf(result, /\/\/ cog:SKIP /, insertLineIndex + 1);
  propertiesToSkip = (skipLineIndex == null) ? [] : getList(result[skipLineIndex], /\/\/ cog:SKIP (.*)$/);
  if (skipLineIndex != null) result.splice(skipLineIndex, 1);

  // check for invalid overlap
  propertiesToInsert.forEach(prop => {
    if (propertiesToSkip.indexOf(prop) !== -1) {
      throw Error(`INSERT & SKIP same property ${prop}`);
    }
  });

  // check for invalid props
  [...propertiesToInsert, ...propertiesToSkip].forEach(prop => {
    if (!schema.properties.hasOwnProperty(prop)) {
      throw Error(`Property ${prop} not found`);
    }
  });

  // check for props not used
  Object.keys(schema.properties).forEach(prop => {
    if (propertiesToInsert.indexOf(prop) === -1 && propertiesToSkip.indexOf(prop) === -1) {
      throw Error(`Unhandled property ${prop}`);
    }
  });

  // check for duplicates
  const usedProps = new Set();
  propertiesToInsert.forEach(prop => {
    if (usedProps.has(prop)) {
      throw Error(`Duplicate declaration of property ${prop}`);
    }
    usedProps.add(prop);
  });

  const propertyLines = [];
  propertiesToInsert.forEach(name => {
    propertyLines.push(...createPropertyDeclaration(name, schema));
  });

  result.splice(insertLineIndex, 1, ...indent(propertyLines, indentCount));
  return result;
}

function fillInTemplate(openApi, template) {
  const lines = template.split('\n');
  let blockInfo = getNextBlock(lines);
  while (blockInfo) {
    const schema = getSchema(openApi, blockInfo.schemaName);
    let block = lines.slice(blockInfo.startIndex, blockInfo.endIndex + 1);
    block = replaceDescription(block, schema.description);
    block = replaceProperties(block, schema);
    lines.splice(blockInfo.startIndex, (blockInfo.endIndex - blockInfo.startIndex) + 1, ...block.slice(1, block.length - 1));
    blockInfo = getNextBlock(lines);
    blockInfo = null;
  }
  return lines.join('\n');
}

async function main() {
  const openApi = await SwaggerParser.bundle('https://storage.googleapis.com/cognitedata-api-docs/openapi.0.6.json');
  const inputDir = './type_templates';
  const outputDir = './src/types';
  for (const { full, file } of ls(`${inputDir}/*`)) {
    const template = fs.readFileSync(full).toString('utf-8');
    const output = fillInTemplate(openApi, template);
    fs.writeFileSync(`${outputDir}/${file}`, output);
  }
}

main().catch((err) => { console.error(err); process.kill(1);});
