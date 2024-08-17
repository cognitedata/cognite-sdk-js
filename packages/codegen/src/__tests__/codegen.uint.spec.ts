import { promises as fs } from 'node:fs';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import {
  CodeGen,
  type StringFilter,
  createPathFilter,
  createServiceNameFilter,
  passThroughFilter,
} from '../codegen';
import { AcacodeOpenApiGenerator } from '../generator/acacode';
import type { OpenApiDocument } from '../openapi';
import { OpenApiSnapshotManager } from '../snapshot';

describe('code generation', () => {
  const testFolder = __dirname;
  let basicSnapshot: OpenApiDocument;
  let basicTypesServiceBGenFile: string;
  let cyclicReferencesGenFile: string;

  beforeAll(async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: '.',
    });

    basicSnapshot = await snapshotMngr.downloadFromPath({
      path: `${testFolder}/testdata`,
      filename: '8-paths.json',
    });

    basicTypesServiceBGenFile = (
      await fs.readFile(`${testFolder}/testdata/8-serviceB-types.gen.ts`)
    ).toString();

    cyclicReferencesGenFile = (
      await fs.readFile(`${testFolder}/testdata/cyclic-references-types.gen.ts`)
    ).toString();
  });

  afterEach(async () => {
    try {
      await fs.unlink(CodeGen.outputFileName);
      // eslint-disable-next-line
    } catch (error) {}
  });

  test('constructor', async () => {
    const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
      autoNameInlinedRequest: false,
      outputDir: '',
      filter: {
        path: passThroughFilter,
      },
    });
    expect(gen).toBeDefined();
  });

  describe('filter paths', () => {
    test('pass through', async () => {
      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: '',
        filter: {
          path: passThroughFilter,
        },
      });

      const beforeFiltering = Object.keys(basicSnapshot.paths).length;
      const paths = gen.filterPaths(basicSnapshot.paths);
      expect(Object.keys(paths)).toHaveLength(beforeFiltering);
    });

    test('service filter', async () => {
      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: '',
        filter: {
          path: createServiceNameFilter('serviceC'),
        },
      });
      expect(Object.keys(basicSnapshot.paths).length).toBeGreaterThan(4);
      const paths = gen.filterPaths(basicSnapshot.paths);
      expect(Object.keys(paths)).toHaveLength(4);
    });

    test('ignore filter', async () => {
      const filter = (
        data: Record<string, object>,
        predicate: StringFilter,
      ): object => {
        return Object.keys(data)
          .filter(predicate)
          .reduce((acc, path) => {
            return Object.assign(acc, { [path]: data[path] });
          }, {});
      };

      const base = '';
      const data = {
        [`${base}/serviceA`]: {},
        [`${base}/serviceB`]: {},
        [`${base}/serviceA/serviceC`]: {},
        [`${base}/serviceA/serviceD`]: {},
      };

      const predicateServiceA = createPathFilter(
        [createServiceNameFilter('serviceA')],
        [],
      );
      expect(Object.keys(filter(data, predicateServiceA))).toEqual([
        `${base}/serviceA`,
        `${base}/serviceA/serviceC`,
        `${base}/serviceA/serviceD`,
      ]);

      const predicateServiceAAndC = createPathFilter(
        [createServiceNameFilter('serviceA')],
        [createServiceNameFilter('serviceA/serviceD')],
      );
      expect(Object.keys(filter(data, predicateServiceAAndC))).toEqual([
        `${base}/serviceA`,
        `${base}/serviceA/serviceC`,
      ]);

      const predicateServiceAOnly = createPathFilter(
        [createServiceNameFilter('serviceA')],
        [
          createServiceNameFilter('serviceA/serviceC'),
          createServiceNameFilter('serviceA/serviceD'),
        ],
      );
      expect(Object.keys(filter(data, predicateServiceAOnly))).toEqual([
        `${base}/serviceA`,
      ]);
    });
  });

  describe('generate types', () => {
    test('serviceB', async () => {
      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: createServiceNameFilter('serviceB'),
        },
      });

      const wants = [
        'CogniteExternalId',
        'CogniteInternalId',
        'EpochTimestamp',
        'Function',
        'FunctionBuildError',
        'FunctionErrorBasic',
        'FunctionErrorResponse',
        'FunctionFileId',
        'FunctionFilter',
        'FunctionListResponse',
        'FunctionListScope',
        'FunctionName',
        'FunctionOwner',
        'FunctionStatus',
        'LimitList',
      ];

      const typeNames = await gen.generateTypes(basicSnapshot);
      expect(typeNames).toEqual(wants);

      const generatedFile = (
        await fs.readFile(CodeGen.outputFileName)
      ).toString();
      expect(generatedFile).toEqual(basicTypesServiceBGenFile);
    });

    test('skip unused schemas', async () => {
      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: passThroughFilter,
        },
      });

      const typeNames = await gen.generateTypes(basicSnapshot);
      expect(typeNames.includes('SomeUnusedOpenApiSchema')).toBeFalsy();
    });

    test('cyclic references', async () => {
      const snapshotMngr = new OpenApiSnapshotManager({ directory: '.' });
      const snapshot = await snapshotMngr.downloadFromPath({
        path: `${testFolder}/testdata`,
        filename: 'cyclic-references.json',
      });

      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: passThroughFilter,
        },
      });

      const wants = ['CyclicResponse', 'Filter', 'FilterOption'];

      const typeNames = await gen.generateTypes(snapshot);
      expect(typeNames).toEqual(wants);

      const generatedFile = (
        await fs.readFile(CodeGen.outputFileName)
      ).toString();
      expect(generatedFile).toEqual(cyclicReferencesGenFile);
    });

    test('restrict to relevant definitions', async () => {
      const snapshotMngr = new OpenApiSnapshotManager({ directory: '.' });
      const snapshot = await snapshotMngr.downloadFromPath({
        path: `${testFolder}/testdata`,
        filename: '8-paths.json',
      });

      const gen = new CodeGen(new AcacodeOpenApiGenerator(), {
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: passThroughFilter,
        },
      });

      const typeNames = await gen.generateTypes(snapshot, [
        'FunctionListScope',
      ]);

      expect(typeNames).toEqual([
        'CogniteExternalId',
        'CogniteInternalId',
        'EpochTimestamp',
        'FunctionFileId',
        'FunctionFilter',
        'FunctionListScope',
        'FunctionName',
        'FunctionOwner',
        'FunctionStatus',
        'LimitList',
      ]);
    });
  });
});
