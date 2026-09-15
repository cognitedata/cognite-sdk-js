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
});
