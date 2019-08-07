// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import { CogniteClient } from '../..';
import { Asset } from '../../resources/classes/asset';
import { AssetList } from '../../resources/classes/assetList';
import { TimeSeries } from '../../resources/classes/timeseries';
import { TimeSeriesList } from '../../resources/classes/timeseriesList';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('TimeSeries class unit test', () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  let newTimeSeries: any;
  let newAsset: any;
  let createdTimeSeries: TimeSeriesList;
  let timeSeriesWithAssetId: TimeSeries;
  let createdAssets: AssetList;
  let datapointArray: any[] = [];
  beforeAll(() => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);
  });
  beforeEach(async () => {
    axiosMock.reset();

    // Create assets
    newAsset = {
      name: 'test-asset' + randomInt(),
      externalId: 'asset' + randomInt(),
      id: randomInt(),
    };
    axiosMock
      .onPost(new RegExp('/assets$'), { items: [newAsset] })
      .replyOnce(200, { items: [newAsset] });
    createdAssets = await client.assets.create([newAsset]);

    // Create timeseries
    newTimeSeries = {
      name: 'test-timeseries',
      externalId: 'timeseries' + randomInt(),
      id: randomInt(),
    };
    timeSeriesWithAssetId = {
      ...newTimeSeries,
      assetId: createdAssets[0].id,
      externalId: 'timeseriesWithAssetId' + randomInt(),
      id: randomInt(),
    };
    axiosMock
      .onPost(new RegExp('/timeseries$'), {
        items: [newTimeSeries, timeSeriesWithAssetId],
      })
      .replyOnce(200, { items: [newTimeSeries, timeSeriesWithAssetId] });
    createdTimeSeries = await client.timeseries.create([
      newTimeSeries,
      timeSeriesWithAssetId,
    ]);

    // Create datapoints
    datapointArray = [];
    const time = randomInt();
    for (let index = 0; index < 3; index++) {
      const datapoint = {
        id: createdTimeSeries[1].id,
        datapoints: [{ timestamp: time + index, value: 10 + index }],
      };
      datapointArray.push(datapoint);
    }
    axiosMock
      .onPost(new RegExp('/timeseries/data$'), {
        items: datapointArray,
      })
      .replyOnce(200);
    await client.datapoints.insert(datapointArray);
  });

  test('create', async () => {
    expect(createdTimeSeries[0]).toBeInstanceOf(TimeSeries);
    expect(createdTimeSeries[0].externalId).toEqual(newTimeSeries.externalId);
    expect(createdTimeSeries[1]).toBeInstanceOf(TimeSeries);
    expect(createdTimeSeries[1].externalId).toEqual(
      timeSeriesWithAssetId.externalId
    );
    expect(createdTimeSeries[1].assetId).toBeDefined();
  });

  test('get asset', async () => {
    axiosMock
      .onPost(new RegExp('/assets/byids$'), {
        items: [{ id: createdTimeSeries[1].assetId }],
      })
      .replyOnce(200, { items: [newAsset] });
    const assetsFromTimeseries = await createdTimeSeries[1].getAsset();
    if (assetsFromTimeseries) {
      expect(assetsFromTimeseries[0]).toBeInstanceOf(Asset);
      expect(assetsFromTimeseries[0].name).toEqual(createdAssets[0].name);
    }
  });

  test('delete', async () => {
    axiosMock
      .onPost(new RegExp('/timeseries/delete$'), {
        items: [{ id: createdTimeSeries[0].id }],
      })
      .replyOnce(200, {});
    await createdTimeSeries[0].delete();
  });

  test('get datapoints', async () => {
    axiosMock
      .onPost(new RegExp('/timeseries/data/list$'), {
        items: [{ id: createdTimeSeries[1].id }],
      })
      .replyOnce(200, { items: datapointArray });
    const fetchedDatapoints = await createdTimeSeries[1].getDatapoints();
    expect(fetchedDatapoints).toHaveLength(3);
    expect(fetchedDatapoints[0].datapoints[0].timestamp).toBeDefined();
  });

  test('get latest datapoints', async () => {
    axiosMock
      .onPost(new RegExp('/timeseries/data/latest$'), {
        items: [{ id: createdTimeSeries[1].id }],
      })
      .replyOnce(200, { items: datapointArray });
    const latestDatapoints = await createdTimeSeries[1].getLatestDatapoints();
    expect(latestDatapoints).toHaveLength(3);
    expect(latestDatapoints[2].datapoints[0].value).toBe(12);
  });
});
