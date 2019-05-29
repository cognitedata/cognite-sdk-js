// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { GetTimeSeriesMetadataDTO } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Datapoints integration test', async () => {
  let client: API;
  let timeserie: GetTimeSeriesMetadataDTO;
  beforeAll(async () => {
    client = await setupClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
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
      items: [{ id: timeserie.id }],
      start: 0,
      end: new Date().getTime(),
    });
    expect(response[0].datapoints).toEqual(datapoints);
  });
});
