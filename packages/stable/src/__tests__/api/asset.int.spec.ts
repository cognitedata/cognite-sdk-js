// Copyright 2020 Cognite AS

import { AssetImpl } from '../../api/classes/asset';
import { EventsAPI } from '../../api/events/eventsApi';
import { TimeSeriesAPI } from '../../api/timeSeries/timeSeriesApi';
import CogniteClient from '../../cogniteClient';
import { CogniteEvent, Timeseries } from '../../types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('Asset', () => {
  let client: CogniteClient;
  const newRootAsset = {
    name: 'test-root',
  };
  const newChildAsset = {
    name: 'test-child',
  };
  const newGrandChildAsset = {
    name: 'test-grandchild',
  };
  beforeAll(() => {
    client = setupLoggedInClient();
  });

  describe('Asset Class', () => {
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
      expect(await createdAssets[1].parent()).toBeInstanceOf(AssetImpl);
      expect(await createdAssets[0].parent()).toBe(null);
      await client.assets.delete([{ id: createdAssets[0].id }], {
        recursive: true,
      });
    });

    test('parentExternalId', async () => {
      const newRoot = {
        ...newRootAsset,
        externalId: 'test-root' + randomInt(),
      };
      const newChild = {
        ...newChildAsset,
        parentExternalId: newRoot.externalId,
      };
      const createdAssets = await client.assets.create([newRoot, newChild]);
      expect(await createdAssets[1].parentExternalId).toBe(newRoot.externalId);
      await client.assets.delete([{ id: createdAssets[0].id }], {
        recursive: true,
      });
    });

    test(
      'subtree',
      async () => {
        const newRoot = {
          ...newRootAsset,
          externalId: 'test-root' + randomInt(),
        };
        const childArray = [];
        for (let index = 0; index < 3; index++) {
          childArray.push({
            ...newChildAsset,
            externalId: 'test-child' + randomInt(),
            parentExternalId: newRoot.externalId,
          });
        }
        const grandChildArray = [];
        for (let index = 0; index < 105; index++) {
          grandChildArray.push({
            ...newGrandChildAsset,
            parentExternalId: childArray[0].externalId,
            externalId: 'test-grandchild' + randomInt(),
          });
        }
        const createdAssets = await client.assets.create([
          newRoot,
          ...childArray,
          ...grandChildArray,
        ]);
        await runTestWithRetryWhenFailing(async () => {
          const subtreeWithDepth2 = await createdAssets[0].subtree({
            depth: 2,
          });
          const subtreeWithDepth1 = await createdAssets[0].subtree({
            depth: 1,
          });
          const subtreeWithoutSpecifiedDepth = await createdAssets[0].subtree();
          expect(subtreeWithDepth2.length).toBe(109);
          expect(subtreeWithDepth1.length).toBe(4);
          expect(subtreeWithoutSpecifiedDepth.length).toBe(109);
        });
        await client.assets.delete([{ id: createdAssets[0].id }], {
          recursive: true,
        });
      },
      3 * 60 * 1000
    );

    test('events from Asset', async () => {
      await testResourceType(client.events);
    });

    test('timeseries from Asset', async () => {
      await testResourceType(client.timeseries);
    });
  });
  async function testResourceType(api: TimeSeriesAPI | EventsAPI) {
    const newRoot = {
      ...newRootAsset,
      externalId: 'test-root' + randomInt(),
    };
    const createdAssets = await client.assets.create([newRoot]);
    const content =
      api instanceof TimeSeriesAPI
        ? { assetId: createdAssets[0].id }
        : { assetIds: [createdAssets[0].id] };
    const resourceList = new Array(5).fill(content);
    const resources = await api.create(resourceList);
    let fetchedResource: (Timeseries | CogniteEvent)[];
    await runTestWithRetryWhenFailing(async () => {
      if (api instanceof TimeSeriesAPI) {
        fetchedResource = await createdAssets[0].timeSeries();
      } else {
        fetchedResource = await createdAssets[0].events();
      }
      expect(fetchedResource.length).toBe(resources.length);
      await api.delete(fetchedResource.map(resource => ({ id: resource.id })));
    });
    await client.assets.delete([{ id: createdAssets[0].id }], {
      recursive: true,
    });
  }
});
