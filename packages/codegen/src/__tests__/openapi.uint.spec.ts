import { OpenApiDocument, ReferenceWalker } from '../openapi';
import { OpenApiSnapshotManager } from '../snapshot';

describe('openapi', () => {
  const testFolder = __dirname;
  let basicbasicSnapshot: OpenApiDocument;

  beforeAll(async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: '.',
    });

    basicbasicSnapshot = await snapshotMngr.downloadFromPath({
      path: testFolder + '/testdata',
      filename: '8-paths.json',
    });
  });

  test('constructor', async () => {
    const walker = new ReferenceWalker(basicbasicSnapshot);
    expect(walker).toBeDefined();
    expect(walker.document).toBeDefined();
  });

  describe('$ref walker', () => {
    test('serviceB', async () => {
      const walker = new ReferenceWalker(basicbasicSnapshot);

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
