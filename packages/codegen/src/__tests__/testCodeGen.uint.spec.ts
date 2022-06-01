// import path from 'path';
import { CodeGen, PassThroughFilter, ServiceNameFilter } from '../codegen';
import { OpenApiDocument } from '../openapi';
import { VersionFileManager } from '../versionfile';
import { promises as fs } from 'fs';

describe('code generation', () => {
  // __dirname produces weird and unexpected results.
  const testFolder = __dirname;
  // const testdata = path.resolve(testFolder, 'testdata');
  let basicVersionFile: OpenApiDocument;
  let basicTypesServiceBGenFile: string;

  beforeAll(async () => {
    const vfm = new VersionFileManager({
      directory: '.',
    });

    basicVersionFile = await vfm.downloadFromPath({
      path: testFolder + '/testdata',
      filename: '8-paths.json',
    });

    basicTypesServiceBGenFile = (
      await fs.readFile(testFolder + '/testdata/8-serviceB-types.gen.ts')
    ).toString();
  });

  afterEach(async () => {
    try {
      await fs.unlink(CodeGen.outputFileName);
      // eslint-disable-next-line
    } catch (error) {}
  });

  test('constructor', async () => {
    const gen = new CodeGen(basicVersionFile, {
      version: 'playground',
      service: 'documents',
      autoNameInlinedRequest: false,
      outputDir: '',
      scope: 'local',
      filter: {
        path: PassThroughFilter,
      },
    });
    expect(gen).toBeDefined();
  });

  describe('filter paths', () => {
    test('pass through', async () => {
      const gen = new CodeGen(basicVersionFile, {
        version: 'playground',
        service: 'documents',
        autoNameInlinedRequest: false,
        outputDir: '',
        scope: 'local',
        filter: {
          path: PassThroughFilter,
        },
      });

      const beforeFiltering = Object.keys(gen.versionFile.paths).length;
      gen['filterPaths']();
      expect(Object.keys(gen.versionFile.paths)).toHaveLength(beforeFiltering);
    });

    test('service filter', async () => {
      const gen = new CodeGen(basicVersionFile, {
        version: 'playground',
        service: 'documents',
        autoNameInlinedRequest: false,
        outputDir: '',
        scope: 'local',
        filter: {
          path: ServiceNameFilter('serviceC'),
        },
      });

      expect(Object.keys(gen.versionFile.paths).length).toBeGreaterThan(4);
      gen['filterPaths']();
      expect(Object.keys(gen.versionFile.paths)).toHaveLength(4);
    });
  });

  describe('generate types', () => {
    test('serviceB', async () => {
      const gen = new CodeGen(basicVersionFile, {
        version: 'playground',
        service: 'serviceB',
        autoNameInlinedRequest: false,
        outputDir: process.cwd(),
        scope: 'local',
        filter: {
          path: ServiceNameFilter('serviceB'),
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

      const typeNames = await gen.generateTypes();
      expect(typeNames).toEqual(wants);

      const generatedFile = (
        await fs.readFile(CodeGen.outputFileName)
      ).toString();
      expect(generatedFile).toEqual(basicTypesServiceBGenFile);
    });
  });
});
