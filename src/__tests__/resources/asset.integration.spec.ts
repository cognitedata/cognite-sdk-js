// Copyright 2019 Cognite AS

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { CogniteClient } from '../..';
import { AssetList } from '../../resources/classes/assetList';
import { EventsAPI } from '../../resources/events/eventsApi';
import { TimeSeriesAPI } from '../../resources/timeSeries/timeSeriesApi';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Asset class', () => {
  const axiosInstance = axios.create();
  const axiosMock = new MockAdapter(axiosInstance);
  let client: CogniteClient;
  beforeAll(() => {
    client = setupLoggedInClient();
  });
  beforeEach(() => {
    axiosMock.reset();
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

  describe('Asset Class', () => {
    const newRootAsset = {
      ...rootAsset,
      externalId: 'test-root' + randomInt(),
    };
    let newChildAsset = {
      ...childAsset,
      parentExternalId: newRootAsset.externalId,
    };
    let newGrandChildAsset = {
      ...childAsset,
      name: 'test-grandchild',
      parentExternalId: newChildAsset.externalId,
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

    test('subtree', async () => {
      const childArray = [];
      for (let index = 0; index < 3; index++) {
        newChildAsset = {
          ...childAsset,
          externalId: 'test-child' + randomInt() + index,
        };
        childArray.push(newChildAsset);
      }
      const grandChildArray = [];
      for (let index = 5; index < 7; index++) {
        newGrandChildAsset = {
          ...childAsset,
          externalId: 'test-grandchild' + randomInt() + index,
        };
        grandChildArray.push(newGrandChildAsset);
      }
      const createdAssets = await client.assets.create([
        newRootAsset,
        ...childArray,
        ...grandChildArray,
      ]);
      expect(createdAssets.length).toBe(6);
      const subtree = await createdAssets[0].subtree(2);
      const subtree2 = await createdAssets[0].subtree(1);
      console.log(subtree);
      expect(subtree.length).toBe(6);
      expect(subtree2.length).toBe(4);
      await client.assets.delete(
        createdAssets.map(asset => ({ id: asset.id }))
      );
    });

    test('events from Asset', async () => {
      const events = new Array(1002).fill({
        assetId: newRootAsset.externalId,
        description: 'Huge event',
      });
      const createdResources = await fetchResourceFromAssetClass(
        client,
        client.events,
        events,
        newRootAsset
      );
      await client.assets.delete([{ id: createdResources.createdAsset[0].id }]);
    });

    test('timeseries from Asset', async () => {
      const timeseries = new Array(2003).fill({
        name: 'Sensor',
        assetId: newRootAsset.externalId,
      });
      const createdAsset = await client.assets.create([newRootAsset]);
      const createdTimeseries = await client.timeseries.create(timeseries);
      expect(createdAsset.length).toBe(1);
      expect(createdTimeseries.length).toBe(timeseries.length);
      const fetchedTimeseries = await createdAsset[0].timeSeries();
      const fetchedTimeseriesArray = await fetchedTimeseries.autoPagingToArray();
      expect(fetchedTimeseriesArray.length).toBe(createdTimeseries.length);
      await client.assets.delete([{ id: createdAsset[0].id }]);
      await client.timeseries.delete(
        createdTimeseries.map(timeserie => ({ id: timeserie.id }))
      );
    });
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
    await client.assets.delete(
      assets.map(asset => ({
        id: asset.id,
      }))
    );
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
});

async function fetchResourceFromAssetClass(
  client: CogniteClient,
  api: TimeSeriesAPI | EventsAPI,
  resourceList: any[],
  newRootAsset: any
) {
  const createdAsset = await client.assets.create([newRootAsset]);
  const resources = await api.create(resourceList);
  expect(resources.length).toBe(resourceList.length);
  let fetchedResource;
  if (api instanceof TimeSeriesAPI) {
    fetchedResource = await createdAsset[0].timeSeries();
  } else {
    fetchedResource = await createdAsset[0].events();
  }
  const fetchedResourceArray = await fetchedResource.autoPagingToArray();
  expect(fetchedResourceArray.length).toBe(resources.length);
  await client.events.delete(resources.map(resource => ({ id: resource.id })));
  return { createdAsset, resources };
}
