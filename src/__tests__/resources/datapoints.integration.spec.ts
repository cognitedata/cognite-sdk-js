// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { GetTimeSeriesMetadataDTO } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Datapoints integration test', () => {
  let client: API;
  let timeserie: GetTimeSeriesMetadataDTO;
  let testTimeserieWithDatapoints: GetTimeSeriesMetadataDTO;
  beforeAll(async () => {
    client = await setupClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
    [testTimeserieWithDatapoints] = await client.timeseries.search({
      // this timeseries comes from https://github.com/cognitedata/test-data-populator
      search: { name: 'test__constant_' },
    });
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
  });

  const datapoints = [
    {
      timestamp: new Date('1 may 2017'),
      value: 10,
    },
    {
      timestamp: new Date('2 may 2017'),
      value: 100,
    },
  ];

  test('insert', async () => {
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints,
      },
    ]);
  });

  test('retrieve', async () => {
    const response = await client.datapoints.retrieve({
      items: [{ id: testTimeserieWithDatapoints.id }],
      start: '2d-ago',
      end: new Date(),
    });
    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeDefined();
  });
});
