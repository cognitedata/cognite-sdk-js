// Copyright 2019 Cognite AS

import { CogniteClient } from '../..';
import { sleepPromise } from '../../utils';
import { setupLoggedInClient } from '../testUtils';

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
    await sleepPromise(2000); // Backend issues
    const timeSeriesFromAssetList = await createdAssets.timeSeries();
    expect(timeSeriesFromAssetList.length).toBe(createdTimeseries.length);
    await client.assets.delete(createdAssets.map(asset => ({ id: asset.id })));
    await client.timeseries.delete(
      createdTimeseries.map(timeserie => ({ id: timeserie.id }))
    );
  });
});
