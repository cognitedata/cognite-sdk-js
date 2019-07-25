// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset } from '../../resources/classes/asset';
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
      expect(parent).toBeInstanceOf(Asset);
      expect(await createdAssets[0].parent()).toBe(null);
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
      expect(children[0]).toBeInstanceOf(Asset);
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
