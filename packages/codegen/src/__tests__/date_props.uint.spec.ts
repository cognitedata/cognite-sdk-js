import { promises as fs } from 'node:fs';
import { afterEach, describe, expect, test } from 'vitest';
import { CodeGen, passThroughFilter } from '../codegen';
import { AcacodeOpenApiGenerator } from '../generator/acacode';
import type { OpenApiSchemas } from '../openapi';

const schemas = (): OpenApiSchemas => ({
  EpochTimestamp: {
    type: 'integer',
    format: 'int64',
    description: 'Milliseconds since the epoch.',
  },
  Item: {
    type: 'object',
    required: ['externalId', 'createdTime', 'lastUpdatedTime'],
    properties: {
      externalId: { type: 'string' },
      createdTime: { $ref: '#/components/schemas/EpochTimestamp' },
      lastUpdatedTime: { $ref: '#/components/schemas/EpochTimestamp' },
    },
  },
  CreatedOnly: {
    type: 'object',
    required: ['createdTime'],
    properties: {
      createdTime: { $ref: '#/components/schemas/EpochTimestamp' },
    },
  },
  OptionalCreated: {
    type: 'object',
    properties: {
      createdTime: { $ref: '#/components/schemas/EpochTimestamp' },
    },
  },
});

const generate = async (dateProps?: string[]): Promise<string> => {
  const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
    autoNameInlinedRequest: false,
    outputDir: process.cwd(),
    dateProps,
    filter: { path: passThroughFilter },
  });
  const result = await gen.generateTypesFromSchemas('3.0.1', schemas());
  return result.astProcessedCode;
};

describe('dateProps transformer', () => {
  afterEach(async () => {
    try {
      await fs.unlink(CodeGen.outputFileName);
    } catch (error) {}
  });

  test('leaves timestamps alone when nothing is declared', async () => {
    const code = await generate([]);

    expect(code).toContain('createdTime: EpochTimestamp');
    expect(code).toContain('lastUpdatedTime: EpochTimestamp');
    expect(code).not.toContain('@cognite/sdk-core');
  });

  test('mixes in CreatedAndLastUpdatedTime when both are declared', async () => {
    const code = await generate(['createdTime', 'lastUpdatedTime']);

    expect(code).toContain('interface Item extends CreatedAndLastUpdatedTime');
    expect(code).not.toContain('createdTime: EpochTimestamp');
    expect(code).not.toContain('lastUpdatedTime: EpochTimestamp');
    // the remaining members survive
    expect(code).toContain('externalId: string');
    expect(code).toMatch(
      /import type \{ CreatedAndLastUpdatedTime, CreatedTime \} from ["']@cognite\/sdk-core["']/
    );
  });

  test('converts only the declared field', async () => {
    const code = await generate(['createdTime']);

    expect(code).toContain('interface Item extends CreatedTime');
    expect(code).toContain('lastUpdatedTime: EpochTimestamp');
    expect(code).not.toContain('createdTime: EpochTimestamp');
  });

  test('an interface left with no members is still valid', async () => {
    const code = await generate(['createdTime']);

    expect(code).toMatch(/interface CreatedOnly extends CreatedTime \{\s*\}/);
  });

  test('optional timestamps are left alone', async () => {
    // the mixins declare their fields as required, so widening an optional
    // member would change the contract
    const code = await generate(['createdTime']);

    expect(code).toContain('interface OptionalCreated');
    expect(code).not.toContain('OptionalCreated extends');
    expect(code).toContain('createdTime?: EpochTimestamp');
  });
});
