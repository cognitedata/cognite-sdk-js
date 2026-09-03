import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as pathUtil from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
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
  Deleted: {
    type: 'object',
    required: ['deletedTime', 'name'],
    properties: {
      deletedTime: { $ref: '#/components/schemas/EpochTimestamp' },
      name: { type: 'string' },
    },
  },
});

// its own directory: the other specs also write CodeGen.outputFileName, and
// vitest runs the files concurrently
let outputDir: string;

const generate = async (dateProps?: string[]): Promise<string> => {
  const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
    autoNameInlinedRequest: false,
    outputDir,
    dateProps,
    filter: { path: passThroughFilter },
  });
  const result = await gen.generateTypesFromSchemas('3.0.1', schemas());
  return result.astProcessedCode;
};

describe('dateProps transformer', () => {
  beforeAll(async () => {
    outputDir = await fs.mkdtemp(
      pathUtil.join(os.tmpdir(), 'codegen-date-props-')
    );
  });

  afterAll(async () => {
    await fs.rm(outputDir, { recursive: true, force: true });
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

  test('a field with no shared interface is rewritten in place', async () => {
    // only createdTime/lastUpdatedTime have interfaces in sdk-core; anything
    // else a service converts still has to stop claiming to be a number
    const code = await generate(['deletedTime']);

    expect(code).toContain('deletedTime: Date');
    expect(code).toContain('name: string');
    expect(code).not.toContain('interface Deleted extends');
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
