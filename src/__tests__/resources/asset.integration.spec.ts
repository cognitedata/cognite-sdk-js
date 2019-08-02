// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset } from '../../resources/classes/asset';
import { EventsAPI } from '../../resources/events/eventsApi';
import { TimeSeriesAPI } from '../../resources/timeSeries/timeSeriesApi';
import { CogniteEvent, GetTimeSeriesMetadataDTO } from '../../types/types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

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
      expect(await createdAssets[1].parent()).toBeInstanceOf(Asset);
      expect(await createdAssets[0].parent()).toBe(null);
      await client.assets.delete([{ id: createdAssets[0].id }], {
        recursive: true,
      });
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
      await runTestWithRetryWhenFailing(async () => {
        const subtreeWithDepth2 = await createdAssets[0].subtree({ depth: 2 });
        const subtreeWithDepth1 = await createdAssets[0].subtree({ depth: 1 });
        const subtreeWithoutSpecifiedDepth = await createdAssets[0].subtree();
        expect(subtreeWithDepth2.length).toBe(109);
        expect(subtreeWithDepth1.length).toBe(4);
        expect(subtreeWithoutSpecifiedDepth.length).toBe(109);
      });
      await client.assets.delete([{ id: createdAssets[0].id }], {
        recursive: true,
      });
    });

    test('events from Asset', async () => {
      await testResourceType(client, client.events, newRootAsset);
    });

    test('timeseries from Asset', async () => {
      await testResourceType(client, client.timeseries, newRootAsset);
    });
  });
});

async function testResourceType(
  client: CogniteClient,
  api: TimeSeriesAPI | EventsAPI
) {
  const newRoot = {
    ...newRootAsset,
    externalId: 'test-root' + randomInt(),
  };
  const createdAssets = await client.assets.create([newRoot]);
  const content =
    api instanceof TimeSeriesAPI
      ? { assetId: createdAssets[0].id }
      : { assetIds: [createdAssets[0].id] };
  const resourceList = new Array(1003).fill(content);
  const resources = await api.create(resourceList);
  let fetchedResource: GetTimeSeriesMetadataDTO[] | CogniteEvent[];
  await runTestWithRetryWhenFailing(async () => {
    if (api instanceof TimeSeriesAPI) {
      fetchedResource = await createdAssets[0].timeSeries();
    } else {
      fetchedResource = await createdAssets[0].events();
    }
    expect(fetchedResource.length).toBe(resources.length);
  });
  // @ts-ignore
  await api.delete(fetchedResource.map(resource => ({ id: resource.id })));
  await client.assets.delete([{ id: createdAssets[0].id }], {
    recursive: true,
  });
}
