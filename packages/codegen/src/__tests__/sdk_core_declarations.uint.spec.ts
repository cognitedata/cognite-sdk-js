import * as ts from 'typescript';
import { describe, expect, test } from 'vitest';

import { isDuplicateOfSdkCoreDeclaration } from '../sdk_core_declarations';

const createSourceFile = (code: string): ts.SourceFile => {
  return ts.createSourceFile(
    'generated.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
};

const buildCoreDeclarations = (code: string) => {
  const sourceFile = createSourceFile(code);
  const declarations = new Map<
    string,
    ts.TypeAliasDeclaration | ts.InterfaceDeclaration
  >();

  for (const statement of sourceFile.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement)
    ) {
      declarations.set(statement.name.escapedText as string, statement);
    }
  }

  return declarations;
};

describe('sdk core declarations', () => {
  test('detects duplicate primitive type aliases from core', () => {
    const sourceFile = createSourceFile(`
      export type CogniteExternalId = string;
      export type CogniteInternalId = number;
    `);

    const duplicates = sourceFile.statements.filter((statement) =>
      isDuplicateOfSdkCoreDeclaration(statement)
    );

    expect(
      duplicates.map((statement) => {
        if (ts.isTypeAliasDeclaration(statement)) {
          return statement.name.escapedText;
        }
        return undefined;
      })
    ).toEqual(['CogniteExternalId', 'CogniteInternalId']);
  });

  test('keeps openapi interfaces that only share a name with core', () => {
    const sourceFile = createSourceFile(`
      export interface CogniteInstanceId {
        externalId: InstanceExternalId;
        space: Space;
      }
    `);

    const duplicates = sourceFile.statements.filter((statement) =>
      isDuplicateOfSdkCoreDeclaration(statement)
    );

    expect(duplicates).toEqual([]);
  });

  test('detects duplicate interfaces when member shapes match', () => {
    const coreDeclarations = buildCoreDeclarations(`
      export interface Widget {
        id: number;
      }
    `);
    const sourceFile = createSourceFile(`
      export interface Widget {
        id: number;
      }
    `);

    expect(
      isDuplicateOfSdkCoreDeclaration(
        sourceFile.statements[0],
        coreDeclarations
      )
    ).toBe(true);
  });

  test('rejects interfaces with different member shapes', () => {
    const coreDeclarations = buildCoreDeclarations(`
      export interface Widget {
        id: number;
      }
    `);
    const sourceFile = createSourceFile(`
      export interface Widget {
        id: string;
      }
    `);

    expect(
      isDuplicateOfSdkCoreDeclaration(
        sourceFile.statements[0],
        coreDeclarations
      )
    ).toBe(false);
  });
});
