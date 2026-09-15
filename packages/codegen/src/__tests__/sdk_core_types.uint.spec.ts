import * as ts from 'typescript';
import { describe, expect, test } from 'vitest';

import sdkCoreTypesTransformer from '../ast_transformer/sdk_core_types';

const printer = ts.createPrinter({ removeComments: true });

const runTransformer = (code: string): string => {
  const sourceFile = ts.createSourceFile(
    'generated.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );
  const result = ts.transform(sourceFile, [sdkCoreTypesTransformer]);
  const transformed = result.transformed[0];
  return printer.printNode(ts.EmitHint.Unspecified, transformed, transformed);
};

const expectSdkCoreImport = (output: string, typeNames: string[]) => {
  for (const typeName of typeNames) {
    expect(output).toMatch(
      new RegExp(
        `import (?:type )?\\{[^}]*\\b${typeName}\\b[^}]*\\} from ["']@cognite/sdk-core["'];`
      )
    );
  }
};

describe('sdk core types transformer', () => {
  test('adds sdk-core import when removing a referenced duplicate type alias', () => {
    const output = runTransformer(`
      export type CogniteExternalId = string;
      export interface Thing {
        x: CogniteExternalId;
      }
    `);

    expectSdkCoreImport(output, ['CogniteExternalId']);
    expect(output).not.toContain('export type CogniteExternalId = string;');
    expect(output).toContain('export interface Thing');
  });

  test('removes duplicate type alias without import when it is not referenced', () => {
    const output = runTransformer('export type CogniteExternalId = string;');

    expect(output).not.toContain('@cognite/sdk-core');
    expect(output).not.toContain('export type CogniteExternalId');
  });
});
