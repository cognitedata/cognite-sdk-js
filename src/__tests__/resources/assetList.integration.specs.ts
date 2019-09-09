// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { runTestWithRetryWhenFailing, setupLoggedInClient } from '../testUtils';

describe('assetList', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('get timeseries', async () => {
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const createdAssets = await client.assets.create(assets);
    const timeseries = [
      { name: 'Pressure sensor', assetId: createdAssets[0].id },
      { name: 'Temprature sensor', assetId: createdAssets[1].id },
    ];
    const createdTimeseries = await client.timeseries.create(timeseries);
    await runTestWithRetryWhenFailing(async () => {
      const timeSeriesFromAssetList = await createdAssets.timeSeries();
      expect(timeSeriesFromAssetList.length).toBe(createdTimeseries.length);
    });
    await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
    await client.timeseries.delete(
      createdTimeseries.map(timeserie => ({ id: timeserie.id }))
    );
  });

  test('get events', async () => {
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const createdAssets = await client.assets.create(assets);
    const events = [
      { description: 'Test event 1', assetIds: [createdAssets[0].id] },
      { description: 'Test event 2', assetIds: [createdAssets[1].id] },
    ];
    const createdEvents = await client.events.create(events);
    await runTestWithRetryWhenFailing(async () => {
      const eventFromAssetList = await createdAssets.events();
      expect(eventFromAssetList.length).toBe(createdEvents.length);
    });
    await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
    await client.events.delete(createdEvents.map(event => ({ id: event.id })));
  });

  test('json stringify', async () => {
    const response = await client.assets.list({ limit: 2 });
    const stringRes = JSON.stringify(response.items);
    expect(typeof stringRes).toBe('string');
  });
});
