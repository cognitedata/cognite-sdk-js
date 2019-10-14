// Copyright 2019 Cognite AS
import { uniqBy } from 'lodash';
import * as nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { TimeSeriesList } from '../../resources/classes/timeSeriesList';
import {
  DatapointsPostDatapoint,
  PostTimeSeriesMetadataDTO,
} from '../../types/types';
import { mockBaseUrl, randomInt, setupMockableClient } from '../testUtils';

describe('TimeSeriesList class unit test', async () => {
  let client: CogniteClient;
  let createdTimeSeries: TimeSeriesList;
  let datapointArray: DatapointsPostDatapoint[] = [];
  let timeseriesArray: PostTimeSeriesMetadataDTO[] = [];
  beforeAll(async () => {
    client = setupMockableClient();
    nock.cleanAll();

    // Create timeseries
    timeseriesArray = [
      {
        name: 'test-timeseries',
        externalId: 'timeseries' + randomInt(),
      },
    ];
    for (let index = 0; index < 2; index++) {
      timeseriesArray.push({
        name: 'test-timeseries' + randomInt(),
        assetId: randomInt(),
      });
    }
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries'), { items: timeseriesArray })
      .once()
      .reply(200, {
        items: timeseriesArray.map(timeseries => ({
          ...timeseries,
          id: randomInt(),
        })),
      });
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
  });

  test('delete', async () => {
    const timeSeriesIds = createdTimeSeries.map(timeseries => ({
      id: timeseries.id,
    }));
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries/delete'), { items: timeSeriesIds })
      .once()
      .reply(200, {});
    await createdTimeSeries.delete();
  });

  test('get all assets', async () => {
    const assetIds = createdTimeSeries
      .map(timeseries => ({
        id: timeseries.assetId,
      }))
      .filter(assetId => assetId.id !== undefined);
    nock(mockBaseUrl)
      .post(new RegExp('/assets/byids'), { items: uniqBy(assetIds, 'id') })
      .once()
      .reply(200, {
        items: [
          { id: createdTimeSeries[1].assetId },
          { id: createdTimeSeries[2].assetId },
        ],
      });
    const assetsFromTimeSeries = await createdTimeSeries.getAllAssets();
    expect(assetsFromTimeSeries).toHaveLength(2);
    expect(assetsFromTimeSeries[0].id).toBeDefined();
  });

  test('get all datapoints', async () => {
    const timeSeriesIds = createdTimeSeries.map(timeseries => ({
      id: timeseries.id,
    }));
    nock(mockBaseUrl)
      .post(new RegExp('/timeseries/data/list'), {
        items: timeSeriesIds,
      })
      .once()
      .reply(200, { items: datapointArray });
    const fetchedDatapoints = await createdTimeSeries.getAllDatapoints();
    expect(fetchedDatapoints).toHaveLength(3);
    expect(fetchedDatapoints[0].datapoints[0].timestamp).toBeDefined();
  });

  describe('class is not polluted with enumerable props', () => {
    const items = [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ];

    beforeEach(() => {
      nock.cleanAll();
      nock(mockBaseUrl)
        .get(new RegExp('/timeseries/'))
        .once()
        .reply(200, { items });
    });

    test('only useful functions are enumerable', async () => {
      const keys = Object.keys(client.timeseries);
      expect(keys).toEqual([
        'create',
        'delete',
        'list',
        'retrieve',
        'search',
        'update',
        'update'
      ]);
    });

    test('JSON.stringify works', async () => {
      const timeseries = await client.timeseries.list().autoPagingToArray();
      expect(() => JSON.stringify(timeseries)).not.toThrow();
      expect(() => JSON.stringify(timeseries[0])).not.toThrow();
    });

    test('change context for asset utility methods', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/timeseries/data/list'))
        .twice()
        .reply(200, { items });
      const timeseries = await client.timeseries.list().autoPagingToArray();
      const utilMethod = timeseries[0].getDatapoints;
      const result = await utilMethod();
      const resultAfterBind = await utilMethod.call(null);
      expect({ ...result[0] }).toEqual({ ...resultAfterBind[0] });
      expect([{ ...result[0] }, { ...result[1] }]).toEqual(items);
    });

    test('spread operator receives only object data props', async () => {
      const timeseries = await client.timeseries.list().autoPagingToArray();
      expect([{ ...timeseries[0] }, { ...timeseries[1] }]).toEqual(items);
      expect(Object.assign({}, timeseries[1])).toEqual(items[1]);
    });
  });
});
