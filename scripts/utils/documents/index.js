// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateApi } = require('swagger-typescript-api');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('/tmp/oas/playground.json');

function panic(message) {
  console.error(message);
  process.exit(1);
}

function generateTypesFromSource(input, output) {
  generateApi({
    name: 'types.gen.ts',
    input: path.resolve(process.cwd(), input),
    generateClient: false,
    toJS: false,
    generateResponses: false,
    extractRequestParams: false,
    extractRequestBody: false,
    generateUnionEnums: true,
    prettier: {
      printWidth: 120,
      tabWidth: 2,
      trailingComma: 'all',
      parser: 'typescript',
    },
    cleanOutput: false,
    enumNamesAsValues: true,
  })
    .then(({ files, configuration }) => {
      files.forEach(({ content, name }) => {
        fs.writeFileSync(path.resolve(process.cwd(), output, name), content);
      });
    })
    .catch(e => console.error(e));
}

function openApiRefTags(obj) {
  let refs = [];
  for (const key in obj) {
    if (key.startsWith('$ref')) {
      refs.push(obj[key]);

    } else if (Array.isArray(obj[key])) {
      for (const v of obj[key]) {
        refs.push(...openApiRefTags(v));
      }

    } else if (typeof obj[key] == 'object') {
      refs.push(...openApiRefTags(obj[key]));
    }
  }

  return refs;
}

function splitRefSegments(ref) {
  const a = ref.split("#").filter(str => str.length > 0);
  if (a.length > 1) {
    panic("unexpected ref tag: " + ref);
  }

  const segments = a[0].split("/").filter(str => str.length > 0);
  return segments;
}

function discoverSubReferences(spec, references) {
  if (references.length === 0) {
    return [];
  }

  const segmentedRefs = references.map(splitRefSegments);

  let newRefs = [];
  for (let ref of segmentedRefs) {
    if (ref[0] !== "components") {
      panic("expected first segment of ref tag to be 'components'");
    }

    const schema = spec.components[ref[1]][ref[2]];
    newRefs.push(...openApiRefTags(schema));
  }

  let newSubRefs = discoverSubReferences(spec, newRefs);
  newRefs.push(...newSubRefs);
  return newRefs.filter(isComponentReference);;
}

function filterPathsByPrefix(paths, prefix) {
  let filteredPaths = {};

  for (const key in paths) {
    if (key.startsWith(prefix)) {
      filteredPaths[key] = paths[key];
    }
  }

  return filteredPaths;
}

function isComponentReference(ref) {
  if (!ref.substring("components")) {
    return false;
  }

  return true;
}

function extractInlineResponseSchemas(paths) {
  // some endpoint define inline schemas, these must be extracted in order to generate a type.
  // 
  let schemas = {};
  for (const [path, endpointDefinitions] of Object.entries(paths)) {
    for (const [httpMethod, definition] of Object.entries(endpointDefinitions)) {
      if (!hasPath(definition, ["content", "application/json", "schema"])) {
        continue;
      }
  
  
      panic("inline responses are not currently supported")
    }
  }

  return Object.entries(schemas);
}

function extractAllOpenApiRefTags(spec) {
  let refs = Object.values(spec.paths)
    .map(endpoint => openApiRefTags(endpoint))
    .flat()
    .filter(isComponentReference);


  refs.push(...discoverSubReferences(spec, refs));
  return Array.from(new Set(refs));
}

function hasPath(root, path) {
  let node = root;
  while (path.length > 0) {
    let key = path.shift();
    if (key in node) {
      node = node[key];
    } else {
      return false;
    }
  }

  return true;
}

function getChild(root, path) {
  let node = root;
  while (path.length > 0) {
    let key = path.shift();
    if (key in node) {
      node = node[key];
    } else {
      return undefined;
    }
  }

  return node;
}

function generate() {
  const spec = JSON.parse(JSON.stringify(config));

  spec.paths = filterPathsByPrefix(spec.paths, '/api/playground/projects/{project}/documents');
  const refs = extractAllOpenApiRefTags(spec);

  spec.componentsOld = spec.components;
  spec.components = {};

  // filter out types not related to our paths/endpoints
  const segmentedRefs = refs.map(splitRefSegments);
  for (const ref of segmentedRefs) {
    var pointer = spec;
    for (const key of ref) {
      if (!(key in pointer)) {
        pointer[key] = {};
      }
      pointer = pointer[key];
    }
    spec.components[ref[1]][ref[2]] = spec.componentsOld[ref[1]][ref[2]];
  }
  delete spec.componentsOld;

  for (const [name, schema] of extractInlineResponseSchemas(spec.paths)) {
    spec.components.schema[name] = schema;
  }

  // some refs are responses, and we must fetch out the schema for any json responses
  for (const [name, responseDefinition] of Object.entries(spec.components.responses)) {
    const schema = getChild(responseDefinition, ["content", "application/json", "schema"]);
    if (typeof schema === 'undefined') {
      continue;
    }

    if (!name.endsWith("Response")) {
      name += "Response";
    }
    spec.components.schemas[name] = schema;
  }

  // some refs are query parameters, and we must fetch out the schema
  // TODO: one query parameters object per endpoint 
  for (const [name, parameterDefinition] of Object.entries(spec.components.parameters)) {
    if (parameterDefinition.in != "query") {
      continue;
    }

    const schema = {
      type: "object",
      properties: {},
    };
    schema.properties[parameterDefinition.name] = parameterDefinition.schema

    spec.components.schemas[name + "QueryParameter"] = schema;
  }

  // remove common types
  delete spec.components.schemas["Error"]
  delete spec.components.schemas["EmptyResponse"]
  errorResponses = []
  for (const [key, _] of Object.entries(spec.components.schemas)) {
    if (key.endsWith("ErrorResponse")) {
      errorResponses.push(key)
    }
  }
  for (let response of errorResponses) {
    delete spec.components.schemas[response]
  }

  const str = JSON.stringify(spec);
  const path = './tmp/playground.json';
  fs.writeFileSync(path, str, err => {
    console.error(err);
  });

  generateTypesFromSource(path, './packages/playground/src/api/documents/');
}

generate();
