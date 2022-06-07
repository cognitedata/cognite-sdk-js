import {
  CodeGen,
  passThroughFilter,
  createServiceNameFilter,
} from '../codegen';
import { OpenApiDocument } from '../openapi';
import { OpenApiSnapshotManager } from '../snapshot';
import { promises as fs } from 'fs';

describe('code generation', () => {
  const testFolder = __dirname;
  let basicVersionFile: OpenApiDocument;
  let basicTypesServiceBGenFile: string;
  let cyclicReferencesGenFile: string;

  beforeAll(async () => {
    const vfm = new OpenApiSnapshotManager({
      directory: '.',
    });

    basicVersionFile = await vfm.downloadFromPath({
      path: testFolder + '/testdata',
      filename: '8-paths.json',
    });

    basicTypesServiceBGenFile = (
      await fs.readFile(testFolder + '/testdata/8-serviceB-types.gen.ts')
    ).toString();

    cyclicReferencesGenFile = (
      await fs.readFile(testFolder + '/testdata/cyclic-references-types.gen.ts')
    ).toString();
  });

  afterEach(async () => {
    try {
      await fs.unlink(CodeGen.outputFileName);
      // eslint-disable-next-line
    } catch (error) {}
  });

  test('constructor', async () => {
    const gen = new CodeGen({
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
      const gen = new CodeGen({
        autoNameInlinedRequest: false,
        outputDir: '',
        filter: {
          path: passThroughFilter,
        },
      });

      const beforeFiltering = Object.keys(basicVersionFile.paths).length;
      const paths = gen['filterPaths'](basicVersionFile.paths);
      expect(Object.keys(paths)).toHaveLength(beforeFiltering);
    });

    test('service filter', async () => {
      const gen = new CodeGen({
        autoNameInlinedRequest: false,
        outputDir: '',
        filter: {
          path: createServiceNameFilter('serviceC'),
        },
      });

      expect(Object.keys(basicVersionFile.paths).length).toBeGreaterThan(4);
      const paths = gen['filterPaths'](basicVersionFile.paths);
      expect(Object.keys(paths)).toHaveLength(4);
    });
  });

  describe('generate types', () => {
    test('serviceB', async () => {
      const gen = new CodeGen({
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: createServiceNameFilter('serviceB'),
        },
      });

      const wants = [
        'FunctionListScope',
        'FunctionFilter',
        'LimitList',
        'FunctionName',
        'FunctionOwner',
        'FunctionFileId',
        'FunctionStatus',
        'CogniteExternalId',
        'EpochTimestamp',
        'CogniteInternalId',
        'FunctionErrorBasic',
        'Function',
        'FunctionBuildError',
        'FunctionListResponse',
        'FunctionErrorResponse',
      ];

      const typeNames = await gen.generateTypes(basicVersionFile);
      expect(typeNames).toEqual(wants);

      const generatedFile = (
        await fs.readFile(CodeGen.outputFileName)
      ).toString();
      expect(generatedFile).toEqual(basicTypesServiceBGenFile);
    });

    test('skip unused schemas', async () => {
      const gen = new CodeGen({
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: passThroughFilter,
        },
      });

      const typeNames = await gen.generateTypes(basicVersionFile);
      expect(typeNames.includes('SomeUnusedOpenApiSchema')).toBeFalsy();
    });

    test('cyclic references', async () => {
      const vfm = new OpenApiSnapshotManager({ directory: '.' });
      const versionFile = await vfm.downloadFromPath({
        path: testFolder + '/testdata',
        filename: 'cyclic-references.json',
      });

      const gen = new CodeGen({
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        filter: {
          path: passThroughFilter,
        },
      });

      const wants = ['CyclicResponse', 'Filter', 'FilterOption'];

      const typeNames = await gen.generateTypes(versionFile);
      expect(typeNames).toEqual(wants);

      const generatedFile = (
        await fs.readFile(CodeGen.outputFileName)
      ).toString();
      expect(generatedFile).toEqual(cyclicReferencesGenFile);
    });
  });
});
