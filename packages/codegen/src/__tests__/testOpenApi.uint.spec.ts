import { OpenApiDocument, ReferenceWalker } from '../openapi';
import { VersionFileManager } from '../versionfile';

describe('open api', () => {
  const testFolder = __dirname;
  let basicVersionFile: OpenApiDocument;

  beforeAll(async () => {
    const vfm = new VersionFileManager({
      directory: '.',
    });

    basicVersionFile = await vfm.downloadFromPath({
      path: testFolder + '/testdata',
      filename: '8-paths.json',
    });
  });

  test('constructor', async () => {
    const walker = new ReferenceWalker(basicVersionFile);
    expect(walker).toBeDefined();
    expect(walker.document).toBeDefined();
  });

  describe('$ref walker', () => {
    test('serviceB', async () => {
      const walker = new ReferenceWalker(basicVersionFile);

      const wants = [
        '#/components/responses/FunctionList',
        '#/components/responses/FunctionErrorResponse',
        '#/components/schemas/FunctionListScope',
      ];

      const path =
        walker.document.paths?.[
          '/api/playground/projects/{project}/serviceB/list'
        ];
      const operation = path!.post;
      const got = walker['references'](operation);
      expect(got).toEqual(wants);
    });
  });
});
