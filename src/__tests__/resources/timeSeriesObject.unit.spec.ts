// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import {
  CogniteClient,
  DatapointsPostDatapoint,
  PostTimeSeriesMetadataDTO,
} from '../../index';
import { Asset } from '../../resources/classes/asset';
import { TimeSeriesList } from '../../resources/classes/timeSeriesList';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('TimeSeries class unit test', () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  let newTimeSeries: PostTimeSeriesMetadataDTO;
  let createdTimeSeries: TimeSeriesList;
  let timeSeriesWithAssetId: PostTimeSeriesMetadataDTO;
  let datapointArray: DatapointsPostDatapoint[] = [];
  beforeAll(() => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);
  });
  beforeEach(async () => {
    axiosMock.reset();

    // Create timeseries
    newTimeSeries = {
      name: 'test-timeseries',
      externalId: 'timeseries' + randomInt(),
    };
    timeSeriesWithAssetId = {
      ...newTimeSeries,
      assetId: randomInt(),
      externalId: 'timeseriesWithAssetId' + randomInt(),
    };
    axiosMock
      .onPost(new RegExp('/timeseries$'), {
        items: [newTimeSeries, timeSeriesWithAssetId],
      })
      .replyOnce(200, {
        items: [newTimeSeries, timeSeriesWithAssetId].map(timeseries => ({
          ...timeseries,
          id: randomInt(),
        })),
      });
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

  test('get asset', async () => {
    axiosMock
      .onPost(new RegExp('/assets/byids$'), {
        items: [{ id: createdTimeSeries[1].assetId }],
      })
      .replyOnce(200, {
        items: [{ id: createdTimeSeries[1].assetId }],
      });
    const assetFromTimeseries = await createdTimeSeries[1].getAsset();
    expect(assetFromTimeseries).not.toBe(null);
    expect(assetFromTimeseries).toBeInstanceOf(Asset);
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
