// Copyright 2022 Cognite AS
import { promises as fs } from 'fs';
import * as tmp from 'tmp-promise';
import * as pathUtil from 'path';

import { generateApi } from 'swagger-typescript-api-nextgen';
import {
  OpenApiDocument,
  OpenApiSchema,
  OpenApiOperationObject,
  isReferenceObject,
  OpenApiPathsObject,
  filterPaths,
  operationsInPath,
  ReferenceWalker,
  OpenApiSchemas,
  OpenApiResponses,
  OpenApiParameters,
  OpenApiReference,
} from './openapi';
import { AutoNameInlinedRequestOption, sortOpenApiJson } from './utils';
import { ServiceConfig } from './configuration';

export type StringFilter = (str: string) => boolean;

export const passThroughFilter: StringFilter = (): boolean => true;

export const createServiceNameFilter = (service: string): StringFilter => {
  const r = new RegExp(`^/api/.+/projects/{project}/${service}($|/)`);
  return (path: string): boolean => r.test(path);
};

export const pathFilterFromConfig = (config: ServiceConfig): StringFilter => {
  return config.filter.serviceName == null
    ? passThroughFilter
    : createServiceNameFilter(config.filter.serviceName);
};

export interface CodeGenOptions extends AutoNameInlinedRequestOption {
  filter: {
    path: StringFilter;
    schema?: StringFilter;
  };
  outputDir: string;
}

export class CodeGen {
  static outputFileName = 'types.gen.ts';

  constructor(readonly options: CodeGenOptions) {}

  /**
   * runSwaggerGenerate generates types for all component schematics.
   */
  private runSwaggerGenerator = async (
    transformedDoc: OpenApiDocument
  ): Promise<void> => {
    const fileComment = `// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the open api contracts.\n\n`;

    const docJson = JSON.stringify(transformedDoc);
    const sortedJson = sortOpenApiJson(docJson);

    const file = await tmp.file({ postfix: '.json' });
    await fs.writeFile(file.path, sortedJson);

    // prettier config is automatically loaded from project config
    const result = await generateApi({
      name: CodeGen.outputFileName,
      input: file.path,
      silent: true,
      generateClient: false,
      toJS: false,
      generateResponses: false,
      extractRequestParams: false,
      extractRequestBody: false,
      generateUnionEnums: true,
      cleanOutput: false,
      enumNamesAsValues: true,
    });

    result.files.forEach(async ({ content }) => {
      await fs.writeFile(
        pathUtil.resolve(this.options.outputDir, CodeGen.outputFileName),
        fileComment + content
      );
    });

    await file.cleanup();
  };

  private operationsWithInlinedRequest = (
    paths: OpenApiPathsObject
  ): [string, OpenApiOperationObject][] => {
    const operations: [string, OpenApiOperationObject][] = [];
    for (const [path, item] of Object.entries(filterPaths(paths))) {
      for (const operation of operationsInPath(item)) {
        const requestBody = operation.requestBody;
        if (requestBody == null || isReferenceObject(requestBody)) {
          continue;
        }

        operations.push([path, operation]);
      }
    }

    return operations;
  };

  private autoNameInlinedRequests = (
    paths: OpenApiPathsObject
  ): [string, OpenApiSchema][] => {
    if (!this.options.autoNameInlinedRequest) {
      return [];
    }

    const inlined: [string, OpenApiSchema][] = [];
    for (const [path, operation] of this.operationsWithInlinedRequest(paths)) {
      const requestBody = operation.requestBody;
      if (requestBody == null || isReferenceObject(requestBody)) {
        continue;
      }

      const schema = requestBody.content?.['application/json']?.schema || {};
      if (isReferenceObject(schema)) {
        continue;
      }

      // schema name
      if (
        operation.operationId == null ||
        operation.operationId.trim() === ''
      ) {
        throw new Error(
          path +
            ': inlined requests must have a operationId specified to automatically name the request type'
        );
      }
      const operationId = operation.operationId.trim();
      let schemaName = this.capitalizeFirstLetter(operationId);
      if (!schemaName.toLowerCase().endsWith('request')) {
        schemaName += 'Request';
      }

      inlined.push([schemaName, schema]);
    }

    return inlined;
  };

  private removeUnusedDefinitions = (doc: OpenApiDocument): OpenApiDocument => {
    const walker = new ReferenceWalker(doc);

    const referencesInOperations = Object.values(doc.paths)
      .map(walker.references)
      .reduce((acc, v) => acc.concat(v), []);

    const references = walker.walk(referencesInOperations);
    const filteredDoc: any = references
      .map(walker.splitReference)
      .reduce((acc, location) => {
        this.copyDefinitionsByLocation(acc, doc, location);
        return acc;
      }, {});

    return {
      ...doc,
      components: {
        ...filteredDoc.components,
      },
    };
  };

  private copyDefinitionsByLocation = (
    dst: any,
    src: any,
    location: string[]
  ) => {
    const next = location.shift()!;
    if (location.length == 0) {
      Object.assign(dst, { [next]: src[next] });
    } else {
      if (!(next in dst)) {
        dst[next] = {};
      }

      this.copyDefinitionsByLocation(dst[next], src[next], location);
    }
  };

  private filterPaths = (paths: OpenApiPathsObject): OpenApiPathsObject => {
    return Object.keys(paths)
      .filter(this.options.filter.path)
      .reduce((acc, path) => {
        return Object.assign(acc, { [path]: paths[path] });
      }, {});
  };

  private transformResponsesToSchemas = (
    responses: OpenApiResponses = {}
  ): [string, OpenApiReference | OpenApiSchema][] => {
    const schemas: OpenApiSchemas = {};
    for (const [name, response] of Object.entries(responses)) {
      if (isReferenceObject(response)) {
        continue;
      }

      const schema = response.content?.['application/json']?.schema;
      if (schema == null) {
        continue;
      }

      const missingResponseSuffix = !name.toLowerCase().endsWith('response');
      const schemaName = missingResponseSuffix ? name + 'Response' : name;
      schemas[schemaName] = schema;
    }

    return Object.entries(schemas);
  };

  private transformQueryParametersToSchemas = (
    parameters: OpenApiParameters = {}
  ): [string, OpenApiReference | OpenApiSchema][] => {
    const schemas: OpenApiSchemas = {};
    for (const [name, parameter] of Object.entries(parameters)) {
      if (isReferenceObject(parameter)) {
        continue;
      }

      if (parameter.in != 'query' || parameter.schema == null) {
        continue;
      }

      const schema: OpenApiSchema = {
        type: 'object',
        properties: {},
      };
      schema.properties![parameter.name] = parameter.schema;

      const missingSuffix = !name.toLowerCase().endsWith('queryparameter');
      const schemaName = missingSuffix ? name + 'QueryParameter' : name;
      schemas[schemaName] = schema;
    }

    return Object.entries(schemas);
  };

  private capitalizeFirstLetter = (str: string): string => {
    const capitalized = str.charAt(0).toUpperCase();
    const remain = str.length > 1 ? str.slice(1) : '';
    return capitalized + remain;
  };

  /**
   * generateTypesFromSchemas
   *
   * @param version open api version (3.0.1, 3.1.0, etc.)
   * @param schemas open api schemas, object where key will be the type name.
   * @param schemaFilter Filter out specific type names
   * @returns names of generated types
   */
  public generateTypesFromSchemas = async (
    version: string,
    schemas: OpenApiSchemas,
    schemaFilter?: StringFilter
  ): Promise<string[]> => {
    if (schemas == null) {
      throw new Error('No schemas to generate types for defined');
    }

    const strippedOpenApiDoc = {
      openapi: version,
      components: { schemas: schemas },
    };

    // deep copy
    const doc = JSON.parse(
      JSON.stringify(strippedOpenApiDoc)
    ) as OpenApiDocument;

    if (schemaFilter != null) {
      doc.components!.schemas = Object.keys(doc.components!.schemas!)
        .filter(schemaFilter)
        .reduce(
          (acc, schemaName) =>
            Object.assign(acc, {
              [schemaName]: doc.components!.schemas![schemaName],
            }),
          {}
        );
    }

    // swagger generator capitalized the first letter
    doc.components!.schemas = Object.keys(doc.components!.schemas!).reduce(
      (acc, name) => {
        const formattedName = this.capitalizeFirstLetter(name);
        return Object.assign(acc, {
          [formattedName]: doc.components!.schemas![name],
        });
      },
      {} as OpenApiSchemas
    );

    const typeNames = Object.keys(doc.components!.schemas!).sort();
    await this.runSwaggerGenerator(doc);

    return typeNames;
  };

  /**
   * generateTypes
   *
   * Derives relevant schemas from responses and other locations before generating types from schemas.
   *
   * @param openApiDoc open api specification to generate types from
   * @returns names of generated types
   */
  public generateTypes = async (
    openApiDoc: OpenApiDocument
  ): Promise<string[]> => {
    // deep copy
    openApiDoc = JSON.parse(JSON.stringify(openApiDoc)) as OpenApiDocument;
    openApiDoc.paths = this.filterPaths(openApiDoc.paths);
    openApiDoc = this.removeUnusedDefinitions(openApiDoc);

    for (const [typeName, schema] of this.transformResponsesToSchemas(
      openApiDoc.components?.responses
    )) {
      if (typeName in openApiDoc.components!.schemas!) {
        throw new Error(
          `Unable to transform response to schema. Schema "${typeName}" already exists`
        );
      }

      openApiDoc.components!.schemas![typeName] = schema;
    }

    for (const [typeName, schema] of this.transformQueryParametersToSchemas(
      openApiDoc.components?.parameters
    )) {
      if (typeName in openApiDoc.components!.schemas!) {
        throw new Error(
          `Unable to transform parameter to schema. Schema "${typeName}" already exists`
        );
      }

      openApiDoc.components!.schemas![typeName] = schema;
    }

    for (const [typeName, schema] of this.autoNameInlinedRequests(
      openApiDoc.paths
    )) {
      if (typeName in openApiDoc.components!.schemas!) {
        throw new Error(
          `Unable to use automatic name for inlined request type. "${typeName}" already exists in the component schemas`
        );
      }

      openApiDoc.components!.schemas![typeName] = schema;
    }

    const skipTypes = [
      // remove the common json error structure as it is not needed here.
      // this is the `{"error": {"message": "hello", "code": 400, ...}}`
      'Error',

      // remove EmptyResponse as this is will never directly be used by the sdk
      // it's just used in openapi to state we return an empty json `{}`.
      'EmptyResponse',
      'ErrorResponse',
    ];

    return await this.generateTypesFromSchemas(
      openApiDoc.openapi,
      openApiDoc.components?.schemas,
      (name: string) => !skipTypes.includes(name)
    );
  };
}
