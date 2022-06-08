import { OpenApiSnapshotManager } from '../snapshot';

describe('version file manager', () => {
  test('load json spec from url', async () => {
    const vfm = new OpenApiSnapshotManager({
      directory: '.',
    });

    const spec = await vfm.downloadFromURL(
      'https://storage.googleapis.com/cognitedata-api-docs/dist/playground.json'
    );
    expect(spec).toBeDefined();
    expect(spec.info.title).toEqual('Cognite playground APIs');
  });
  test('load json spec from default url', async () => {
    const vfm = new OpenApiSnapshotManager({
      version: 'playground',
      directory: '.',
    });

    const wants = await vfm.downloadFromURL(
      'https://storage.googleapis.com/cognitedata-api-docs/dist/playground.json'
    );

    const got = await vfm.downloadFromURL();

    expect(got).toEqual(wants);
  });
});