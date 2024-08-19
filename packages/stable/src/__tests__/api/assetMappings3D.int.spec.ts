// Copyright 2020 Cognite AS

import {
  Asset,
  AssetMapping3D,
  Model3D,
  Node3D,
  Revision3D,
} from 'stable/src/types';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { setupLoggedInClient } from '../testUtils';

describe.skip('AssetMappings3D integration test', () => {
  let client: CogniteClient;
  let model: Model3D;
  let revision: Revision3D;
  let asset: Asset;
  let node: Node3D;
  let assetMapping: AssetMapping3D;

  beforeAll(async () => {
    client = setupLoggedInClient();

    // Find 3D model with revision (there are many models without revisions in the test data)
    const models = await client.models3D.list().autoPagingToArray();
    for (const m of models) {
      const revisions = (await client.revisions3D.list(m.id, {})).items;
      if (revisions.length > 0) {
        model = m;
        revision = revisions[0];
        break;
      }
    }
    if (model === undefined || revision === undefined) {
      fail('Could not find 3D model with a valid revision in the test data');
    }

    [asset] = (await client.assets.list()).items;
    if (asset === undefined) {
      fail('Could not find any assets in the test dataset');
    }

    [node] = (
      await client.revisions3D.list3DNodes(model.id, revision.id)
    ).items;
    if (node === undefined) {
      fail(
        `Could not find any nodes for 3D model ${model.id}/${revision.id} in the test data`
      );
    }

    // Create asset mapping
    await client.assetMappings3D.create(model.id, revision.id, [
      {
        assetId: asset.id,
        nodeId: node.id,
      },
    ]);
    // Retrieve asset mapping (bug in create causes it not to return treeIndex which we need, see
    // https://cognitedata.atlassian.net/browse/BND3D-677)
    [assetMapping] = (
      await client.assetMappings3D.list(model.id, revision.id, {
        assetId: asset.id,
      })
    ).items;

    if (assetMapping === undefined) {
      fail('Was not able to fetch asset mapping from test data');
    }
  });

  afterAll(async () => {
    await client.assetMappings3D.delete(model.id, revision.id, [
      { nodeId: node.id, assetId: asset.id },
    ]);
  });

  test('list with wrong intersectsBoundingBox query fails', async () => {
    await expect(
      client.assetMappings3D.list(model.id, revision.id, {
        intersectsBoundingBox: { min: [], max: [] },
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"max and min must have length 3 | code: 400"`
    );
  });

  test('filter without query succeeds', async () => {
    const response = await client.assetMappings3D.filter(
      model.id,
      revision.id,
      {}
    );
    expect(response.items.length).toBeGreaterThanOrEqual(1);
  });

  test('filter with nodeIds filter succeeds', async () => {
    const response = await client.assetMappings3D.filter(
      model.id,
      revision.id,
      {
        filter: { nodeIds: [assetMapping.nodeId] },
      }
    );
    expect(response.items.length).toBeGreaterThanOrEqual(1); // Test data might contain more than one mapping
  });

  test('filter with treeIndexes filter succeeds', async () => {
    const response = await client.assetMappings3D.filter(
      model.id,
      revision.id,
      {
        filter: { treeIndexes: [assetMapping.treeIndex] },
      }
    );
    expect(response.items.length).toBeGreaterThanOrEqual(1); // Test data might contain more than one mapping
  });

  test('filter with assetIds filter succeeds', async () => {
    const response = await client.assetMappings3D.filter(
      model.id,
      revision.id,
      {
        filter: { assetIds: [assetMapping.assetId] },
      }
    );
    expect(response.items.length).toBeGreaterThanOrEqual(1); // Test data might contain more than one mapping
  });
});
