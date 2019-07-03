// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
// tslint:disable-next-line:no-commented-code
// import { EventsAPI } from '../../resources/events/eventsApi';
// import { TimeSeriesAPI } from '../../resources/timeSeries/timeSeriesApi';
// import { CogniteEvent, GetTimeSeriesMetadataDTO } from '../../types/types';
import { sleepPromise } from '../../utils';
import { setupLoggedInClient } from '../testUtils';

describe('assetList', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  test('get timeseries', async () => {
    // tslint:disable-next-line:no-commented-code
    // const fetchedResources = getResources(client, client.timeseries);
    // await client.timeseries.delete(fetchedResources.map(timeserie => ({ id: timeserie.id })));

    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const createdAssets = await client.assets.create(assets);
    const timeseries = [
      { name: 'Pressure sensor', assetId: createdAssets[0].id },
      { name: 'Temprature sensor', assetId: createdAssets[1].id },
    ];
    const createdTimeseries = await client.timeseries.create(timeseries);
    await sleepPromise(2000); // Backend issues
    const timeSeriesFromAssetList = await createdAssets.timeSeries();
    expect(timeSeriesFromAssetList.length).toBe(createdTimeseries.length);
    await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
    await client.timeseries.delete(
      createdTimeseries.map(timeserie => ({ id: timeserie.id }))
    );
  });

  test('get events', async () => {
    // tslint:disable-next-line:no-commented-code
    // const fetchedResources = getResources(client, client.events);
    // await client.events.delete(fetchedResources.map(event => ({ id: event.id })));
    const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
    const createdAssets = await client.assets.create(assets);
    const events = [
      { description: 'Test event 1', assetIds: [createdAssets[0].id] },
      { description: 'Test event 2', assetIds: [createdAssets[1].id] },
    ];
    const createdEvents = await client.events.create(events);
    await sleepPromise(2000); // Backend issues
    const eventFromAssetList = await createdAssets.events();
    expect(eventFromAssetList.length).toBe(createdEvents.length);
    await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
    await client.events.delete(createdEvents.map(event => ({ id: event.id })));
  });
});

// Help method for testing that is not really pretty, cleaner to just keep the code above?

// tslint:disable-next-line:no-commented-code
// async function getResources(client: CogniteClient, api: TimeSeriesAPI | EventsAPI) {
//   const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
//   const createdAssets = await client.assets.create(assets);
//   const timeseriesData: any[] = [
//     { assetId: createdAssets[0].id },
//     { assetId: createdAssets[1].id },
//   ];
//   const eventData: any[] = [
//     { assetIds: [createdAssets[0].id] },
//     { assetIds: [createdAssets[1].id] },
//   ];
//   const content = api instanceof TimeSeriesAPI ? timeseriesData : eventData;
//   const createdResource = await api.create(content);
//   await sleepPromise(2000); // Backend issues
//   let fetchedResource: GetTimeSeriesMetadataDTO[] | CogniteEvent[];
//   if (api instanceof TimeSeriesAPI) {
//     fetchedResource = await createdAssets[0].timeSeries();
//   } else {
//     fetchedResource = await createdAssets[0].events();
//   }
//   expect(fetchedResource.length).toBe(createdResource.length);
//   await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
//   return fetchedResource;
// }
