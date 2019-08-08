// Copyright 2019 Cognite AS
import MockAdapter from 'axios-mock-adapter';
import { uniqBy } from 'lodash';
import { CogniteClient } from '../../index';
import { TimeSeriesList } from '../../resources/classes/timeSeriesList';
import {
  DatapointsPostDatapoint,
  PostTimeSeriesMetadataDTO,
} from '../../types/types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('TimeSeriesList class unit test', async () => {
  let axiosMock: MockAdapter;
  let client: CogniteClient;
  let createdTimeSeries: TimeSeriesList;
  let datapointArray: DatapointsPostDatapoint[] = [];
  let timeseriesArray: PostTimeSeriesMetadataDTO[] = [];
  beforeAll(async () => {
    client = setupLoggedInClient();
    axiosMock = new MockAdapter(client.instance);

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
    axiosMock
      .onPost(new RegExp('/timeseries$'), {
        items: timeseriesArray,
      })
      .replyOnce(200, {
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
    axiosMock
      .onPost(new RegExp('/timeseries/data$'), {
        items: datapointArray,
      })
      .replyOnce(200);
    await client.datapoints.insert(datapointArray);
  });

  beforeEach(async () => {
    axiosMock.reset();
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
      .replyOnce(200, {
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
