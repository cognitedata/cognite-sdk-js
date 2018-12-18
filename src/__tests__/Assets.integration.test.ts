// Copyright 2018 Cognite AS

import * as sdk from '../index';

describe('Asset integration test', () => {
  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    refId: 'test-root',
  };

  const childAsset = {
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentRefId: 'test-root',
  };

  beforeAll(async () => {
    sdk.configure({
      project: 'cognitesdk-js',
      apiKey: process.env.COGNITE_CREDENTIALS,
    });
    const assets: Array<Partial<sdk.Asset>> = [rootAsset, childAsset];
    try {
      await sdk.Assets.create(assets);
    } catch (ex) {
      if (ex.status === 400) {
        // The API returns 400 on duplicates
        // Assuming this will work
        return;
      }
      console.error(
        'Make sure that both test-root and test-child is existing.'
      );
      throw ex;
    }
  });

  test('search for root test asset', async () => {
    const result = await sdk.Assets.search({
      metadata: { refId: rootAsset.metadata.refId },
    });
    const asset = result.items[0];
    expect(rootAsset.name).toBe(asset.name);
    expect(rootAsset.description).toBe(asset.description);

    const childResult = await sdk.Assets.search({
      assetSubtrees: [asset.id],
    });
    // We get both the root and child here.
    expect(childResult.items.length).toEqual(2);
    const childSearchAsset = childResult.items[1];
    expect(childSearchAsset.name).toEqual(childAsset.name);
    expect(childSearchAsset.metadata!.refId).toEqual(childAsset.metadata.refId);
  });
});
