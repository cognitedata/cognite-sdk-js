import { describe, expect, test } from 'vitest';
import { OpenApiSnapshotManager } from '../snapshot';

describe('version file manager', () => {
  test('load json doc from url', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      directory: '.',
    });

    const doc = await snapshotMngr.downloadFromUrl(
      'https://storage.googleapis.com/cognitedata-api-docs/dist/playground.json',
    );
    expect(doc).toBeDefined();
    expect(doc.info.title).toEqual('Cognite playground APIs');
  });
  test('load json doc from default url', async () => {
    const snapshotMngr = new OpenApiSnapshotManager({
      version: 'playground',
      directory: '.',
    });

    const wants = await snapshotMngr.downloadFromUrl(
      'https://storage.googleapis.com/cognitedata-api-docs/dist/playground.json',
    );

    const got = await snapshotMngr.downloadFromUrl();

    expect(got).toEqual(wants);
  });
});
