// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import { uniqBy } from 'lodash';
import { CogniteClient } from '../..';
import { AssetList } from '../../resources/classes/assetList';
import { TimeSeriesList } from '../../resources/classes/timeSeriesList';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('TimeSeriesList class unit test', async () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  let newAsset: any;
  let createdTimeSeries: TimeSeriesList;
  let timeSeriesWithAssetId: any;
  let createdAssets: AssetList;
  let datapointArray: any[];
  let assetsArray: any[] = [];
  let timeseriesArray: any[] = [];
  beforeAll(() => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);
  });
  beforeEach(async () => {
    axiosMock.reset();

    // Create assets
    assetsArray = [];
    for (let index = 0; index < 5; index++) {
      newAsset = {
        name: 'test-asset' + randomInt(),
        externalId: 'asset' + randomInt(),
        id: randomInt(),
      };
      assetsArray.push(newAsset);
    }
    axiosMock
      .onPost(new RegExp('/assets$'), { items: assetsArray })
      .replyOnce(200, { items: assetsArray });
    createdAssets = await client.assets.create(assetsArray);

    // Create timeseries
    timeseriesArray = [
      {
        name: 'test-timeseries',
        externalId: 'timeseries' + randomInt(),
        id: randomInt(),
      },
    ];
    for (let index = 0; index < 5; index++) {
      timeSeriesWithAssetId = {
        name: 'test-timeseries' + randomInt(),
        assetId: createdAssets[index].id,
        id: randomInt(),
      };
      timeseriesArray.push(timeSeriesWithAssetId);
    }
    axiosMock
      .onPost(new RegExp('/timeseries$'), {
        items: timeseriesArray,
      })
      .replyOnce(200, { items: timeseriesArray });
    createdTimeSeries = await client.timeseries.create(timeseriesArray);

    // Create datapoints
    datapointArray = [];
    const time = randomInt();
    for (let index = 0; index < 3; index++) {
      const datapoint = {
        id: createdTimeSeries[index].id,
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

  test('delete', async () => {
    const timeSeriesIds = createdTimeSeries.map(timeseries => ({
      id: timeseries.id,
    }));
    axiosMock
      .onPost(new RegExp('/timeseries/delete$'), {
        items: timeSeriesIds,
      })
      .replyOnce(200, {});
    await createdTimeSeries.delete();
  });

  test('get all assets', async () => {
    const assetIds = createdTimeSeries
      .map(timeseries => ({
        id: timeseries.assetId,
      }))
      .filter(assetId => assetId.id !== undefined);
    axiosMock
      .onPost(new RegExp('/assets/byids$'), { items: uniqBy(assetIds, 'id') })
      .replyOnce(200, { items: assetsArray });
    const assetsFromTimeSeries = await createdTimeSeries.getAllAssets();
    expect(assetsFromTimeSeries).toHaveLength(5);
    expect(assetsFromTimeSeries[0].id).toBeDefined();
  });

  test('get all datapoints', async () => {
    const timeSeriesIds = createdTimeSeries.map(timeseries => ({
      id: timeseries.id,
    }));
    axiosMock
      .onPost(new RegExp('/timeseries/data/list$'), {
        items: timeSeriesIds,
      })
      .replyOnce(200, { items: datapointArray });
    const fetchedDatapoints = await createdTimeSeries.getAllDatapoints();
    expect(fetchedDatapoints).toHaveLength(3);
    expect(fetchedDatapoints[0].datapoints[0].timestamp).toBeDefined();
  });
});
