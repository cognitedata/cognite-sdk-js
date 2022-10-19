// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Timeseries } from '../../types';
import { setupLoggedInClient } from '../testUtils';

describe('Datapoints integration test', () => {
  let client: CogniteClient;
  let timeserie: Timeseries;

  const timestampFrom = Date.now() - 60 * 60 * 48 * 1000;
  const timestampTill = Date.now() - 60 * 60 * 24 * 1000;
  const datapoints = [
    {
      timestamp: new Date(timestampTill),
      value: 10,
    },
    {
      timestamp: new Date(timestampFrom),
      value: 100,
    },
  ];

  beforeAll(async () => {
    client = setupLoggedInClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
  });

  test('insert', async () => {
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints,
      },
    ]);
  });

  test('retrieve-with-conversion', async () => {
    const response = await client.datapoints.retrieve(
      {
        items: [{ id: timeserie.id }],
        start: '1d-ago',
        end: new Date(),
      },
      {
        outputUnit: 'string',
      }
    );
    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
    expect(response[0].isString).toBe(false);
  });
});
