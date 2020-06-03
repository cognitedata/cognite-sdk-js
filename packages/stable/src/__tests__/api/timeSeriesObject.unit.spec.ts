// Copyright 2020 Cognite AS
import * as nock from 'nock';
import { Asset } from '../../api/classes/asset';
import { TimeSeriesList } from '../../api/classes/timeSeriesList';
import CogniteClient from '../../cogniteClient';
import {
  DatapointsPostDatapoint,
  PostTimeSeriesMetadataDTO,
} from '../../types';
import { mockBaseUrl, randomInt, setupMockableClient } from '../testUtils';

describe('TimeSeries class unit test', () => {
  let client: CogniteClient;
  let newTimeSeries: PostTimeSeriesMetadataDTO;
  let createdTimeSeries: TimeSeriesList;
  let timeSeriesWithAssetId: PostTimeSeriesMetadataDTO;
  let datapointArray: DatapointsPostDatapoint[] = [];
  beforeAll(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });
  beforeEach(async () => {
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
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries'), {
        items: [newTimeSeries, timeSeriesWithAssetId],
      })
      .once()
      .reply(200, {
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
  });

  test('get asset', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/assets/byids'), {
        items: [{ id: createdTimeSeries[1].assetId }],
      })
      .once()
      .reply(200, {
        items: [{ id: createdTimeSeries[1].assetId }],
      });
    const assetFromTimeseries = await createdTimeSeries[1].getAsset();
    expect(assetFromTimeseries).not.toBe(null);
    expect(assetFromTimeseries).toBeInstanceOf(Asset);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries/delete'), {
        items: [{ id: createdTimeSeries[0].id }],
      })
      .once()
      .reply(200, {});
    await createdTimeSeries[0].delete();
  });

  test('get datapoints', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries/data/list'), {
        items: [{ id: createdTimeSeries[1].id }],
      })
      .once()
      .reply(200, { items: datapointArray });
    const fetchedDatapoints = await createdTimeSeries[1].getDatapoints();
    expect(fetchedDatapoints).toHaveLength(3);
    expect(fetchedDatapoints[0].datapoints[0].timestamp).toBeDefined();
  });

  test('get latest datapoints', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries/data/latest'), {
        items: [{ id: createdTimeSeries[1].id }],
      })
      .once()
      .reply(200, { items: datapointArray });
    const latestDatapoints = await createdTimeSeries[1].getLatestDatapoints();
    expect(latestDatapoints).toHaveLength(3);
    expect(latestDatapoints[2].datapoints[0].value).toBe(12);
  });
});
