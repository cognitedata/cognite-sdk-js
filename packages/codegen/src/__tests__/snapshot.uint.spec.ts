import path from 'path';
import { OpenApiSnapshotManager } from '../snapshot';

describe('snapshot manager', () => {
  const testFolder = __dirname;
  const testdata = path.resolve(testFolder, 'testdata');

  test('constructor', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: testFolder,
    });
    expect(snapshotMngr).toBeDefined();
  });

  test('load from local json snapshot', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: testFolder,
    });

    const snapshot = await snapshotMngr.downloadFromPath({ path: testFolder });
    expect(snapshot).toBeDefined();
    expect(snapshot.info.title).toEqual('Cognite API');
  });

  test('load from local json snapshot without filter', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: testFolder,
    });

    const snapshot = await snapshotMngr.downloadFromPath({
      path: testdata,
      filename: '8-paths.json',
    });
    expect(snapshot).toBeDefined();
    expect(Object.entries(snapshot.paths)).toHaveLength(8);
  });

  test('load existing snapshot', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      version: 'v1',
      directory: testFolder,
    });

    const snapshot = await snapshotMngr.downloadFromPath({
      path: testdata,
      filename: '8-paths.json',
    });
    expect(snapshot).toBeDefined();
    expect(Object.entries(snapshot.paths)).toHaveLength(8);
  });
});
