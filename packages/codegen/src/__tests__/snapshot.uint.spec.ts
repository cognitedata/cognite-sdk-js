import path from 'path';
import { OpenApiSnapshotManager } from '../snapshot';

describe('version file manager', () => {
  const testFolder = __dirname;
  const testdata = path.resolve(testFolder, 'testdata');

  test('constructor', async () => {
    const v = new OpenApiSnapshotManager({
      directory: testFolder,
    });
    expect(v).toBeDefined();
  });

  test('load from local json spec', async () => {
    const vfm = new OpenApiSnapshotManager({
      directory: testFolder,
    });

    const spec = await vfm.downloadFromPath({ path: testFolder });
    expect(spec).toBeDefined();
    expect(spec.info.title).toEqual('Cognite playground APIs');
  });

  test('load from local json spec without filter', async () => {
    const vfm = new OpenApiSnapshotManager({
      directory: testFolder,
    });

    const spec = await vfm.downloadFromPath({
      path: testdata,
      filename: '8-paths.json',
    });
    expect(spec).toBeDefined();
    expect(Object.entries(spec.paths)).toHaveLength(8);
  });

  test('load existing versionfile', async () => {
    const vfm = new OpenApiSnapshotManager({
      version: 'v1',
      directory: testFolder,
    });

    const spec = await vfm.downloadFromPath({
      path: testdata,
      filename: '8-paths.json',
    });
    expect(spec).toBeDefined();
    expect(Object.entries(spec.paths)).toHaveLength(8);
  });
});