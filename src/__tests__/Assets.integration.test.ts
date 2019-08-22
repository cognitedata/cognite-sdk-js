// Copyright 2018 Cognite AS

import { Asset } from '../Assets';
import * as sdk from '../index';
import { sleepPromise } from '../utils';

function randomInt() {
  return Math.floor(Math.random() * 10000000000);
}

describe('Asset integration test', () => {
  const rootAsset = {
    name: 'test-root-' + randomInt(),
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
    const assets: Partial<sdk.Asset>[] = [rootAsset, childAsset];
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

  test(
    'search for root test asset',
    async () => {
      await sleepPromise(5000); // annoying eventual consistency
      const result = await sdk.Assets.list({
        name: rootAsset.name,
      });
      const asset = result.items[0];
      expect(rootAsset.name).toBe(asset.name);
      expect(rootAsset.description).toBe(asset.description);

      const childResult = await sdk.Assets.list({
        path: [asset.id],
        depth: 1,
      });
      childResult.items.sort((a: Asset, b: Asset) => {
        return (a.depth as number) - (b.depth as number);
      });

      // We get both the root and child here.
      expect(childResult.items.length).toEqual(2);
      const childListAsset = childResult.items[1];
      expect(childListAsset.name).toEqual(childAsset.name);
      expect(childListAsset.metadata!.refId).toEqual(childAsset.metadata.refId);
    },
    15000
  );
});
