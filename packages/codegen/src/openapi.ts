// Copyright 2022 Cognite AS
import { OpenAPIV3 } from 'openapi-types';

export type OpenApiDocument = OpenAPIV3.Document;
export type OpenApiSchema = OpenAPIV3.SchemaObject;
export type OpenApiReference = OpenAPIV3.ReferenceObject;
export type OpenApiPathItem = OpenAPIV3.PathItemObject;
export type OpenApiOperationObject = OpenAPIV3.OperationObject;
export type OpenApiPathsObject = OpenAPIV3.PathsObject;
export type OpenApiSchemas = OpenAPIV3.ComponentsObject['schemas'];
export type OpenApiResponses = NonNullable<
  OpenAPIV3.ComponentsObject['responses']
>;
export type OpenApiParameters = NonNullable<
  OpenAPIV3.ComponentsObject['parameters']
>;
export type OpenApiParameter = OpenAPIV3.ParameterObject;
export type OpenApiComponents = OpenAPIV3.ComponentsObject;

export interface FilteredPathsObject {
  [pattern: string]: OpenApiPathItem;
}

export function isReferenceObject(
  item: object
): item is OpenAPIV3.ReferenceObject {
  return '$ref' in item;
}

export function filterPaths(paths: OpenApiPathsObject): FilteredPathsObject {
  return Object.keys(paths)
    .filter((k) => paths[k] != null)
    .reduce((acc, key) => {
      return Object.assign(acc, { [key]: paths[key] });
    }, {} as FilteredPathsObject);
}

export function operationsInPath(
  pathItem: OpenApiPathItem
): OpenApiOperationObject[] {
  return Object.keys(pathItem)
    .filter((key) =>
      Object.values(OpenAPIV3.HttpMethods).includes(
        key as OpenAPIV3.HttpMethods
      )
    )
    .map((key) => key as keyof typeof pathItem)
    .map((key) => pathItem[key] as OpenApiOperationObject);
}

export class ReferenceWalker {
  readonly document: OpenApiDocument;
  constructor(document: OpenApiDocument) {
    // deep copy
    this.document = JSON.parse(JSON.stringify(document)) as OpenApiDocument;
  }

  public references = (
    obj:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV3.ParameterObject
      | OpenAPIV3.RequestBodyObject
      | OpenAPIV3.CallbackObject
      | OpenAPIV3.SchemaObject
      | OpenAPIV3.HeaderObject
      | undefined
  ): string[] => {
    const refs: string[] = [];
    for (const key in obj) {
      const typedKey = key as keyof typeof obj;
      const value = obj[typedKey];
      if (key.startsWith('$ref')) {
        refs.push(value);
      } else if (Array.isArray(value)) {
        for (const v of value as []) {
          refs.push(...this.references(v));
        }
      } else if (typeof obj[typedKey] === 'object') {
        refs.push(...this.references(obj[typedKey]));
      }
    }

    return refs;
  };

  public schema = (reference: string) => {
    const segments = this.splitReference(reference);
    if (segments[0] !== 'components') {
      throw new Error("Expected first segment of ref tag to be 'components'");
    }

    const componentCategory = segments[1] as keyof OpenAPIV3.ComponentsObject;
    const typeName = segments[2];
    const schema = this.document.components?.[componentCategory]?.[typeName];
    return schema;
  };

  public splitReference = (ref: string): string[] => {
    const a = ref.split('#').filter((str) => str.length > 0);
    if (a.length > 1) {
      throw new Error(
        `A OpenAPI reference ($ref) is expected to only contain one hashtag, found ${a.length}.`
      );
    }

    const segments = a[0].split('/').filter((str) => str.length > 0);
    return segments;
  };

  public walk = (references: string[]) => {
    const history = [...references];
    const unexplored = [...references];
    while (unexplored.length > 0) {
      const reference = unexplored.pop();
      if (!reference) {
        continue;
      }
      const schema = this.schema(reference);
      const references = this.references(schema);

      for (const discovered of references) {
        if (history.includes(discovered)) {
          continue;
        }

        history.push(discovered);
        unexplored.push(discovered);
      }
    }

    return history;
  };

  public deduplicate = (references: string[]): string[] => {
    return Array.from(new Set(references));
  };
}
