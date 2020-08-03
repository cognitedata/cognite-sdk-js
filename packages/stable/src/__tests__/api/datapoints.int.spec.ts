// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Timeseries } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe('Datapoints integration test', () => {
  let client: CogniteClient;
  let timeserie: Timeseries;
  let testTimeserieWithDatapoints: Timeseries;
  beforeAll(async () => {
    client = setupLoggedInClient();
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
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
    expect(response[0].isString).toBe(false);
  });

  test('retrieve latest', async () => {
    const response = await client.datapoints.retrieveLatest([
      {
        before: '1d-ago',
        id: testTimeserieWithDatapoints.id,
      },
    ]);
    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
  });

  test('synthetic query', async () => {
    const result = await client.timeseries.syntheticQuery([
      {
        expression: `24 * TS{id=${testTimeserieWithDatapoints.id}}`,
        start: '48h-ago',
        limit: 1,
      },
    ]);
    expect(result.length).toBe(1);
    expect(result[0].datapoints[0].timestamp).toBeInstanceOf(Date);
  });
});
