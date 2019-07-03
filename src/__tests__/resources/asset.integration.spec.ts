// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { AssetList } from '../../resources/classes/assetList';
import { EventsAPI } from '../../resources/events/eventsApi';
import { TimeSeriesAPI } from '../../resources/timeSeries/timeSeriesApi';
import { CogniteEvent, GetTimeSeriesMetadataDTO } from '../../types/types';
import { sleepPromise } from '../../utils';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Asset', () => {
  let client: CogniteClient;
  beforeAll(() => {
    client = setupLoggedInClient();
  });
  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    externalId: 'test-root' + randomInt(),
  };

  const childAsset = {
    // tslint:disable-next-line:no-duplicate-string
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentExternalId: rootAsset.externalId,
    externalId: 'test-child' + randomInt(),
  };
  let assets: AssetList;

  test('create', async () => {
    assets = await client.assets.create([childAsset, rootAsset]);
    expect(assets[0].createdTime).toBeInstanceOf(Date);
    expect(assets[0].lastUpdatedTime).toBeInstanceOf(Date);
  });

  test('update', async () => {
    await client.assets.update([
      {
        id: assets[0].id,
        update: {
          name: { set: 'New name' },
        },
      },
    ]);
  });

  test('delete', async () => {
    await assets[0].delete();
  });

  test('list', async () => {
    await client.assets
      .list({
        filter: {
          name: rootAsset.name,
          createdTime: { min: 0, max: Date.now() },
        },
      })
      .autoPagingToArray({ limit: 100 });
  });

  test('search for root test asset', async () => {
    const result = await client.assets.search({
      search: {
        name: rootAsset.name,
      },
    });
    const asset = result[0];
    expect(rootAsset.name).toBe(asset.name);
    expect(rootAsset.description).toBe(asset.description);
  });

  describe('Asset Class', () => {
    const newRootAsset = {
      name: 'test-root',
    };
    const newChildAsset = {
      name: 'test-child',
    };
    const newGrandChildAsset = {
      name: 'test-grandchild',
    };

    test('create 1001 assets sequencially', async () => {
      const childArr = new Array(1000).fill(newChildAsset);
      const createdAssets = await client.assets.create([
        newRootAsset,
        ...childArr,
      ]);
      expect(createdAssets.length).toBe(1001);
      await client.assets.delete(
        createdAssets.slice(1).map(asset => ({ id: asset.id }))
      );
      await client.assets.delete([{ id: createdAssets[0].id }]);
    });

    test('parent', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      const newChild = {
        ...newChildAsset,
        parentExternalId: newRoot.externalId,
      };
      const createdAssets = await client.assets.create([newRoot, newChild]);
      const parent = await createdAssets[1].parent();
      if (parent) {
        expect(parent.id).toEqual(createdAssets[0].id);
      }
      const parent2 = await createdAssets[0].parent();
      expect(parent2).toBe(null);
      await client.assets.delete([{ id: createdAssets[0].id }]);
    });

    test('children', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      const newChild = {
        ...newChildAsset,
        parentExternalId: newRoot.externalId,
      };
      const createdAssets = await client.assets.create([
        newRoot,
        newChild,
        newChild,
      ]);
      const children = await createdAssets[0].children();
      expect(children.length).toBe(2);
      await client.assets.delete([{ id: createdAssets[0].id }]);
    });

    test('subtree', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      const childArray = [];
      for (let index = 0; index < 3; index++) {
        childArray.push({
          ...newChildAsset,
          externalId: 'test-child' + randomInt() + index,
          parentExternalId: newRoot.externalId,
        });
      }
      const grandChildArray = [];
      for (let index = 0; index < 105; index++) {
        grandChildArray.push({
          ...newGrandChildAsset,
          parentExternalId: childArray[0].externalId,
          externalId: 'test-grandchild' + randomInt() + index,
        });
      }
      const createdAssets = await client.assets.create([
        newRoot,
        ...childArray,
        ...grandChildArray,
      ]);
      await sleepPromise(2000); // eventual consistency in the backend
      const subtree = await createdAssets[0].subtree({ depth: 2 });
      const subtree2 = await createdAssets[0].subtree({ depth: 1 });
      const subtree3 = await createdAssets[0].subtree();
      expect(subtree.length).toBe(109);
      expect(subtree2.length).toBe(4);
      expect(subtree3.length).toBe(109);
      await client.assets.delete([{ id: createdAssets[0].id }]);
    });

    test('events from Asset', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      await fetchResourceFromAssetClass(client, client.events, newRoot);
    });

    test('timeseries from Asset', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      await fetchResourceFromAssetClass(client, client.timeseries, newRoot);
    });
  });
});

async function fetchResourceFromAssetClass(
  client: CogniteClient,
  api: TimeSeriesAPI | EventsAPI,
  newRootAsset: any
) {
  const createdAssets = await client.assets.create([newRootAsset]);
  const content =
    api instanceof TimeSeriesAPI
      ? { assetId: createdAssets[0].id }
      : { assetIds: [createdAssets[0].id] };
  const resourceList = new Array(1003).fill(content);
  const resources = await api.create(resourceList);
  await sleepPromise(10000); // eventual consistency in the backend
  let fetchedResource: GetTimeSeriesMetadataDTO[] | CogniteEvent[];
  if (api instanceof TimeSeriesAPI) {
    fetchedResource = await createdAssets[0].timeSeries();
  } else {
    fetchedResource = await createdAssets[0].events();
  }
  expect(fetchedResource.length).toBe(resources.length);
  // @ts-ignore
  await api.delete(fetchedResource.map(resource => ({ id: resource.id })));
  await client.assets.delete([{ id: createdAssets[0].id }]);
}
