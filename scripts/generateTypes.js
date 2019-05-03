const fs = require('fs');
const ls = require('ls');
const SwaggerParser = require('swagger-parser');
const Mustache = require('Mustache');

const START_TEMPLATE = 'cog:Start';
const END_TEMPLATE = 'cog:End';
const INSERT_TEMPLATE = 'cog:Insert';
const SKIP_TEMPLATE = 'cog:Skip';
const DESCRIPTION_TEMPLATE = 'cog:Description';

// Javascript
function createSimpleJavascriptDocComment(comment) {
  console.log(comment);
  return fillTemplateFromFile('./type_templates/comment.mustache', {
    comment
  });
}

// { type: 'object',
//   required: [ 'code', 'message' ],
//   properties:
//    { code:
//       { type: 'integer',
//         description: 'HTTP status code',
//         format: 'int32',
//         example: 401 },
//      message:
//       { type: 'string',
//         description: 'Error message',
//         example: 'Could not authenticate.' },
//      extra: { type: 'object', description: 'Additional data' } } }

function parseObject(name, schema) {
  const requiredProps = new Set(schema.required);
  console.log(schema);
  const result = createJavascriptObject(name, requiredProps, schema.properties);
  console.log(result);
  return result;
}

function createJavascriptObject(name, requiredProps, props) {
  const typedProps = {};
  Object.keys(props).forEach(propName => {
    const typedProp = createJavascriptProp(propName, props[propName], requiredProps.has(propName));
    typedProps[propName] = typedProp;
  });

  return {
    name,
    props: Object.keys(typedProps).map(propName => {
      return {
        prop: typedProps[propName],
      };
    }),
  };
}

function createJavascriptProp(name, schema, isRequired) {
  const jsMap = {
    integer: 'number',
    string: 'string',
    object: 'object',
  };

  let type;
  if (jsMap[schema.type]) {
    type = jsMap[schema.type];
  } else {
    throw Error(`Unknown type ${schema.type}`);
  }

  const view = {
    name,
    isRequired,
    type,
    description: schema.description,
  };

  return fillTemplateFromFile('./type_templates/property.mustache', view);
}

function getSchemaFromDTO(openApi, dtoName) {
  return openApi.components.schemas[dtoName];
}

function getSchemaFromOperationId(openApi, operationId) {
  let result = null;
  Object.keys(openApi.paths).forEach(path => {
    Object.keys(openApi.paths[path]).forEach(httpVerb => {
      const schema = openApi.paths[path][httpVerb];
      if (schema.operationId === operationId) {
        result = { path, httpVerb, schema };
      }
    });
  });
  return result;
}

function createPropertyDeclaration(name, description, type, items = {}, isRequired = false) {
  const createType = (value) => {
    return isRequired ? `${name}: ${value};` : `${name}?: ${value};`;
  };
  let tsType;
  const metadataType = createType('{ [key: string]: string }');
  const dateType = createType('Date');
  switch (type) {
    case 'integer': {
      switch (name) {
        case 'createdTime':
          tsType = dateType;
          description = 'Time when the resource was created';
          break;
        case 'lastUpdatedTime':
          tsType = dateType;
          description = 'Time when the resource was last modified';
          break;
        default: {
          tsType = createType('number');
          break;
        }
      }
      break;
    }

    case 'string': {
      if (name === 'metadata')
        tsType = metadataType;
      else
        tsType = createType('string');
      break;
    }

    case 'array': {
      if (items.type === 'integer')
        tsType = createType('number[]');
      else if (items.type === 'string')
        tsType = createType('string[]');
      break;
    }

    case 'object': {
      if (name === 'metadata')
        tsType = metadataType;
      else
        tsType = createType('object');
      break;
    }

    default:
      throw Error(`Unknown type ${type}`);
  }
  return [
    ...createSimpleJsDocComment(description),
    tsType
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

function getList(line, regEx) {
  return line.match(regEx)[1].split(', ');
}

function indexOf(arr, regEx, fromIndex) {
  for (let i = fromIndex; i < arr.length; i++) {
    if (regEx.test(arr[i])) {
      return i;
    }
  }
  return null;
}

// type = 'DTO' | 'Query'
function getNextBlock(lines, type) {
  const startTemplate = `${START_TEMPLATE}${type}`;
  const endTemplate = `${END_TEMPLATE}${type}`;
  const startIndex = indexOf(lines, new RegExp(`// ${startTemplate}`), 0);
  if (startIndex == null) return null;
  const id = lines[startIndex].match(new RegExp(`// ${startTemplate} (.*)$`))[1];
  const endIndex = indexOf(lines, new RegExp(`// ${endTemplate} ${id}`), startIndex + 1);
  if (endIndex == null) throw Error(`Missing close tag for ${id}`);
  return { startIndex, endIndex, id };
}

function getNextDTOBlock(lines) {
  return getNextBlock(lines, 'DTO');
}

function getNextQueryBlock(lines) {
  return getNextBlock(lines, 'Query');
}

function getCommonElements(arr1, arr2) {
  const elements = [];
  arr1.forEach(item => {
    if (arr2.indexOf(item) !== -1) {
      elements.push(item);
    }
  });
  return elements;
}

function getDuplicates(arr) {
  const duplicateItems = [];
  const usedItems = new Set();
  arr.forEach(item => {
    if (usedItems.has(item) && duplicateItems.indexOf(item) === -1) {
      duplicateItems.push(item);
    }
    usedItems.add(item);
  });
  return duplicateItems;
}

function replaceDescription(lines, description) {
  const result = [...lines];
  const regEx = new RegExp(`// ${DESCRIPTION_TEMPLATE}$`);
  let index = indexOf(result, regEx, 0);
  while (index != null) {
    result.splice(index, 1, ...createSimpleJsDocComment(description)); 
    index = indexOf(result, regEx, 0);
  }
  return result;
}

function extractPropertyTemplateInfo(lines) {
  const insertLineIndex = indexOf(lines, new RegExp(`// ${INSERT_TEMPLATE} `), 0);
  if (insertLineIndex == null) return null;
  const indentCount = getIndentCount(lines[insertLineIndex]);
  propertiesToInsert =  getList(lines[insertLineIndex], new RegExp(`// ${INSERT_TEMPLATE} (.*)$`));
  const skipLineIndex = indexOf(lines, new RegExp(`// ${SKIP_TEMPLATE} `), insertLineIndex + 1);
  propertiesToSkip = (skipLineIndex == null) ? [] : getList(lines[skipLineIndex], new RegExp(`// ${SKIP_TEMPLATE} (.*)$`));
  if (skipLineIndex != null) lines.splice(skipLineIndex, 1);
  lines.splice(insertLineIndex, 1);

  // check for invalid overlap
  const commonProps = getCommonElements(propertiesToInsert, propertiesToSkip);
  if (commonProps.length !== 0) {
    throw Error(`INSERT & SKIP same property ${commonProps[0]}`);
  }

  // check for duplicates
  const duplicatedElements = getDuplicates(propertiesToInsert);
  if (duplicatedElements.length !== 0) {
    throw Error(`Duplicate declaration of property ${duplicatedElements[0]}`);
  }

  return {
    propertiesToInsert,
    propertiesToSkip,
    indentCount,
    lineIndex: insertLineIndex,
  };
}

function validatePropsWithTemplate(propMap, propertiesToInsert, propertiesToSkip) {
  // check for invalid props
  [...propertiesToInsert, ...propertiesToSkip].forEach(prop => {
    if (!propMap.hasOwnProperty(prop)) {
      throw Error(`Property ${prop} not found`);
    }
  });

  // check for props not used
  Object.keys(propMap).forEach(prop => {
    if (propertiesToInsert.indexOf(prop) === -1 && propertiesToSkip.indexOf(prop) === -1) {
      throw Error(`Unhandled property ${prop}`);
    }
  });
}

function replaceProperties(lines, schema) {
  const result = [...lines];

  const propertyInfo = extractPropertyTemplateInfo(result);
  if (propertyInfo == null) {
    console.log(lines);
    throw Error(`No property template info found`);
  }
  const { propertiesToInsert, propertiesToSkip, indentCount, lineIndex } = propertyInfo;
  validatePropsWithTemplate(schema.properties, propertiesToInsert, propertiesToSkip);
  

  const propertyLines = [];
  propertiesToInsert.forEach(name => {
    const { description, type, items } = schema.properties[name];
    propertyLines.push(...createPropertyDeclaration(name, description, type, items));
  });

  result.splice(lineIndex, 0, ...indent(propertyLines, indentCount));
  return result;
}

function replaceQueryParams(lines, schema) {
  const result = [...lines];
  const propertyInfo = extractPropertyTemplateInfo(result);
  if (propertyInfo == null) {
    console.log(lines);
    throw Error(`No property template info found`);
  }
  const { propertiesToInsert, propertiesToSkip, indentCount, lineIndex } = propertyInfo;

  const parameters = {};
  schema.parameters.filter(item => item.in === 'query').forEach(item => {
    parameters[item.name] = item;
  });
  validatePropsWithTemplate(parameters, propertiesToInsert, propertiesToSkip);

  const propertyLines = [];
  propertiesToInsert.forEach(name => {
    const { description, schema: {type}, required } = parameters[name];
    propertyLines.push(...createPropertyDeclaration(name, description, type, {}, required));
  });
  result.splice(lineIndex, 0, ...indent(propertyLines, indentCount));
  return result;
}

function fillInTemplate(openApi, template) {
  const lines = template.split('\n');
  // DTOs
  {
    let blockInfo = getNextDTOBlock(lines);
    while (blockInfo) {
      const schema = getSchemaFromDTO(openApi, blockInfo.id);
      let block = lines.slice(blockInfo.startIndex, blockInfo.endIndex + 1);
      block = replaceDescription(block, schema.description);
      block = replaceProperties(block, schema);
      lines.splice(blockInfo.startIndex, (blockInfo.endIndex - blockInfo.startIndex) + 1, ...block.slice(1, block.length - 1));
      blockInfo = getNextDTOBlock(lines);
    }
  }
  // Queries
  {
    let blockInfo = getNextQueryBlock(lines);
    while (blockInfo) {
      const operationId = blockInfo.id;
      const endpointInfo = getSchemaFromOperationId(openApi, operationId);
      if (endpointInfo == null) {
        throw Error(`Query info for operationId ${operationId} not found`);
      }
      const { schema } = endpointInfo;
      let block = lines.slice(blockInfo.startIndex, blockInfo.endIndex + 1);
      block = replaceQueryParams(block, schema);
      lines.splice(blockInfo.startIndex, (blockInfo.endIndex - blockInfo.startIndex) + 1, ...block.slice(1, block.length - 1));
      blockInfo = null; // getNextQueryBlock(lines);
    }
  }
  return lines.join('\n');
}

function fillTemplateFromFile(filename, view) {
  const template = fs.readFileSync(filename).toString('utf-8');
  return Mustache.render(template, view);
}

function isAllOfObject(schema) {
  return schema.allOf;
}

function parseAllOfObject(schema) {
  const extend = [];
  const schemas = [];
  schema.allOf.forEach(innerSchema => {
    if (innerSchema.$ref) {
      extend.push(innerSchema.$ref);
    } else {
      schemas.push(innerSchema);
    }
  });
  // if (schemas.length >= 2) {
  //   throw Error(`Can't handle num schemas >= 2`);
  // }
  return { extend, schemas };
}

function parseSchemas(openApi) {
  const { schemas } = openApi.components;
  Object.keys(schemas).forEach(schemaName => {
    const schema = schemas[schemaName];
    if (schemaName === 'Asset') {
      console.log(schema);
    }
    if (isAllOfObject(schema)) {
      console.log(schemaName);
      console.log(parseAllOfObject(schema));
    }
    // console.log(schemaName);
    // console.log(schemas[schemaName]);
  });
}

async function main() {
  const parser = new SwaggerParser();
  const openApi = await parser.parse('https://storage.googleapis.com/cognitedata-api-docs/dist/v1.json');
  const inputDir = './type_templates';
  const outputDir = './src/types';

  console.log(openApi);
  parseSchemas(openApi);
  // const error = parser.$refs.get('#/components/schemas/Asset');

  // parseObject('Asset', error);
  // console.log(error);
  return;

  for (const { full, file } of ls(`${inputDir}/*.mustache`)) {
    const template = fs.readFileSync(full).toString('utf-8');
    const output = Mustache.render(template, {
      'AssetV2': {
        'id': () => {console.log('nice!'); return 'halla';},
        'description': 'abc\nnew line 1\nnew line 2',
      },
    });
    console.log(output);
    // const output = fillInTemplate(openApi, template);
    // fs.writeFileSync(`${outputDir}/${file}`, output);
  }
}

main().catch((err) => { console.error(err); process.kill(1);});
