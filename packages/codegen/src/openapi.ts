// Copyright 2022 Cognite AS
import { OpenAPIV3 } from 'openapi-types';

export type OpenApiDocument = OpenAPIV3.Document;
export type OpenApiSchema = OpenAPIV3.SchemaObject;
export type OpenApiPathItem = OpenAPIV3.PathItemObject;
export type OpenApiOperationObject = OpenAPIV3.OperationObject;
export type OpenApiPathsObject = OpenAPIV3.PathsObject;

export interface FilteredPathsObject {
  [pattern: string]: OpenApiPathItem;
}

export function isReferenceObject(
  item: any
): item is OpenAPIV3.ReferenceObject {
  return '$ref' in item;
}

export function filterPaths(paths: OpenApiPathsObject): FilteredPathsObject {
  return Object.keys(paths)
    .filter((k) => typeof paths[k] !== 'undefined')
    .reduce((acc, key) => {
      return Object.assign(acc, { [key]: paths[key] });
    }, {} as FilteredPathsObject);
}

export function operationsInPaths(
  paths: OpenApiPathsObject
): OpenApiOperationObject[] {
  const filtered = filterPaths(paths);
  return Object.values(filtered)
    .map(operationsInPath)
    .reduce((acc, v) => acc.concat(v), []);
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
    this.document = JSON.parse(JSON.stringify(document)) as OpenApiDocument;
  }

  public references = (obj: any): string[] => {
    const refs: string[] = [];
    for (const key in obj) {
      if (key.startsWith('$ref')) {
        refs.push(obj[key]);
      } else if (Array.isArray(obj[key])) {
        for (const v of obj[key]) {
          refs.push(...this.references(v));
        }
      } else if (typeof obj[key] == 'object') {
        refs.push(...this.references(obj[key]));
      }
    }

    return refs;
  };

  public schema = (reference: string): any => {
    const segments = this.splitReference(reference);
    if (segments[0] !== 'components') {
      console.error("expected first segment of ref tag to be 'components'");
      process.exit(1);
    }

    const componentCategory = segments[1] as keyof OpenAPIV3.ComponentsObject;
    const typeName = segments[2];
    const schema = this.document.components![componentCategory]![typeName];
    return schema;
  };

  public splitReference = (ref: string): string[] => {
    const a = ref.split('#').filter((str) => str.length > 0);
    if (a.length > 1) {
      console.error('unexpected ref tag: ' + ref);
      process.exit(1);
    }

    const segments = a[0].split('/').filter((str) => str.length > 0);
    return segments;
  };

  public walk = (references: string[]) => {
    if (references.length === 0) {
      return [];
    }

    const history = [...references];
    const unexplored = [...references];
    while (unexplored.length > 0) {
      const reference = unexplored.pop()!;
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
