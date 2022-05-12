// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateApi } = require('swagger-typescript-api');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs').promises;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fsSync = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https');
const download = require('download');


function panic(message) {
  console.error(message);
  process.exit(1);
}

function importsToString(imports) {
  let importsDecleration = ``;
  for (const importStmt of imports) {
    if (importStmt.types.length == 0) {
      continue;
    }

    importsDecleration += `
import {
  ${importStmt.types.map(t => `${t},\n`).join('')}
} from '${importStmt.package}';
\n
`;
  }

  return importsDecleration;
}

function generateTypesFromSource(input, output, imports, command) {
  const codegenComment = `
// Do not modify this file!
// It was generated by the command "yarn generate-types ${command}".
// Instead update the code generation logic or the service contracts.
\n
  `;
  // TODO: how can we remove already defined types?
  //  1. converting the generated file to ast, remove duplicate nodes, and then back to ts
  const importsDecleration = ""; // importsToString(imports);

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
        fsSync.writeFileSync(path.resolve(process.cwd(), output, name), codegenComment + importsDecleration + content);
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

const processOpenAPIReference = () => {
  let cache = {};
  return (spec, reference) => {
    if (reference in cache) {
      return [];
    }

    const segments = splitRefSegments(reference);
    if (segments[0] !== "components") {
      panic("expected first segment of ref tag to be 'components'");
    }

    const schema = spec.components[segments[1]][segments[2]];
    cache[reference] = true;

    return openApiRefTags(schema);
  }
}

const referenceProcessor = processOpenAPIReference();

function discoverSubReferences(spec, references) {
  if (references.length === 0) {
    return [];
  }

  let newRefs = [];
  for (let ref of references) {
    newRefs.push(...referenceProcessor(spec, ref));
  }

  const deduplicatedRefs = deduplicate(newRefs);
  let newSubRefs = discoverSubReferences(spec, newRefs);
  newRefs.push(...newSubRefs);
  return newRefs.filter(isComponentReference);;
}

function deduplicate(elements) {
  return Array.from(new Set(elements))
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

function extractQueryParameterSchemas(spec) {
  if (!('parameters' in spec.components)) {
    return {}
  }

  let schemas = {};
  for (const [name, parameterDefinition] of Object.entries(spec.components.parameters)) {
    if (parameterDefinition.in != "query") {
      continue;
    }

    const schema = {
      type: "object",
      properties: {},
    };
    schema.properties[parameterDefinition.name] = parameterDefinition.schema

    schemas[name] = schema;
  }

  return schemas;
}

const fileContainsType = (filePath) => {
  let cache = {};
  let fileData = fsSync.readFileSync(filePath).toString();

  return (typeName) => {
    if (typeName in cache) {
      return true;
    }

    let result = false;
    for (const t of ["type", "interface"]) {
      const declaration = `export ${t} ${typeName} `;
      if (fileData.includes(declaration)) {
        result = true;
        break;
      }
    }

    cache[typeName] = result;
    return result;
  };
};

// generate types for a given api version and service.
// Note the functionality for generating types from responses is bugged as of writing this
// and to compensate we extract the json schema from each related response definition
// and store them in the components spec.
function generate(package, service, version, spec) {

  spec.paths = filterPathsByPrefix(spec.paths, `/api/${version}/projects/{project}/${service}`);
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
  const extractedParameters = extractQueryParameterSchemas(spec);
  for (const [name, schema] of Object.entries(extractedParameters)) {
    spec.components.schemas[name + "QueryParameter"] = schema;
  }

  // remove the common json error structure as it is not needed here.
  // this is the `{"error": {"message": "hello", "code": 400, ...}}`
  delete spec.components.schemas["Error"]
  
  // remove EmptyResponse as this is will never directly be used by the sdk
  // it's just used in openapi to state we return an empty json `{}`.
  delete spec.components.schemas["EmptyResponse"]

  // Remove all references to error responses, as the sdk instead just throws an except
  // no custom type per api version is utilized so these are redundant.
  errorResponses = []
  for (const [key, _] of Object.entries(spec.components.schemas)) {
    if (key.endsWith("ErrorResponse")) {
      errorResponses.push(key)
    }
  }
  for (let response of errorResponses) {
    delete spec.components.schemas[response]
  }

  // identify which components are defined in the core and can be imported
  let coreImports = [];
  const fileContains = fileContainsType("./packages/core/src/types.ts");
  for (const [key, _] of Object.entries(spec.components.schemas)) {
    if (fileContains(key)) {
      coreImports.push(key);
    }
  }

  // save the updated spec so we can autogenerate the types from swagger
  const str = JSON.stringify(spec);
  const path = `./tmp/types.json`;
  fsSync.writeFileSync(path, str, err => {
    console.error(err);
  });

  const imports = [
    {
      "package": '@cognite/sdk-core',
      "types": coreImports,
    }
  ];

  const outputDir = `./packages/${package}/src/api/${service}`;
  generateTypesFromSource(path, outputDir, imports, `${package}:${service}`);
}

const createLockfileName = (stage) => `.${stage}.types.lockfile`;

const createLockfilePath = (package, service, stage) => {
  return `${createLockfileDirPath(package, service)}/${createLockfileName(stage)}`;
}

const createLockfileDirPath = (package, service) => {
  return `./packages/${package}/src/api/${service}`;
};

const createCurrentLockfilePath = (package, service) => createLockfilePath(package, service, "current");
const createCurrentLockfileName = () => createLockfileName("current");
const createIncomingLockfilePath = (package, service) => createLockfilePath(package, service, "incoming");
const createIncomingLockfileName = () => createLockfileName("current");

const isUpdatedLockfile = (lockfilePath) => {
  return lockfilePath.endsWith(".incoming.types.lockfile")
}

const updateLockfile = async (package, service, version) => {
  console.log("updating lock file");
  const dir = createLockfileDirPath(package, service);
  const filename = createIncomingLockfileName();
  const openApiUrl = `https://storage.googleapis.com/cognitedata-api-docs/dist/${version}.json`;
  const path = `${dir}/${filename}`;
  return download(openApiUrl, dir, {filename: filename})
    .then(data => JSON.stringify(JSON.parse(data)))
    .then(data => fs.writeFile(path, data))
    .then(_ => path);
}

const lockfile = (package, service, version) => {
  return new Promise((resolve, reject) => {
    const path = createCurrentLockfilePath(package, service);
    return fs.access(path)
      .then(_ => resolve(path))
      .catch(_ => {
        // first time generating code for service, setup a lockfile
        return updateLockfile(package, service, version)
          .then(newPath => resolve(newPath))
          .catch(err => reject(err));
      })
  })
}

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    panic("expects at least one argument in the form of `version:service`. eg. `stable:documents`");
  }
  if (!args[0].includes(":")) {
    panic("must specify the version and service seperated by a `:`");
  }

  const [package, service] = args[0].split(":");

  const packagePath = `./packages/${package}`;
  await fs.access(packagePath).catch(err => panic(err));

  const servicePath = `${packagePath}/src/api/${service}`;
  await fs.access(servicePath)
    .catch(_ => {
      return fs.mkdir(servicePath, {recursive: true});
    })
    .catch(err => panic(err))
  
  const mustUpdateLockfile = args.length > 1 && args[1] === "update-lockfile";
  const version = package === "playground" ? "playground" : "v1";

  await lockfile(package, service, version)
    .then(lockfilePath => {
      if (!isUpdatedLockfile(lockfilePath) && mustUpdateLockfile) {
        console.log("updating lockfile to latest");
        return updateLockfile(package, service, version);
      } else {
        return lockfilePath;
      }
    })
    .then(lockfilePath => {
      return fs.readFile(lockfilePath).then(data => {
        console.log(`generating code for ${service} service. Package: ${package}`)
        const jsonData = JSON.parse(data.toString('utf8'));
        generate(package, service, version, jsonData);
        return lockfilePath;
      })
    })
    .then(lockfilePath => {
      console.log("cleaning up");
      if (isUpdatedLockfile(lockfilePath)) {
        const currentLockfilePath = createCurrentLockfilePath(package, service);
        return fs.copyFile(lockfilePath, currentLockfilePath).then(() => {
          return fs.rm(lockfilePath);
        });
      }
    })
    .catch(err => panic(err));
}


if (process.versions.node.split(".")[0] < 16) {
  panic("nodejs version must be v16 or higher");
}
main();
