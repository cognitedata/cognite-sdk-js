// Copyright 2020 Cognite AS

import unitConverter from '../../api/utils/unitConverter';
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
      timestamp: new Date(timestampTill + 1),
      value: 1,
    },
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
    [timeserie] = await client.timeseries.create([
      { name: 'tmp', unit: 'ft3/s' },
    ]);
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

  test('retrieve', async () => {
    const response = await client.datapoints.retrieve({
      items: [{ id: timeserie.id }],
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
        id: timeserie.id,
      },
    ]);

    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
  });

  test('retrieve with conversion', async () => {
    const response = await client.datapoints.retrieve(
      {
        items: [{ id: timeserie.id }],
        start: '2d-ago',
        end: new Date(),
      },
      {
        outputUnit: 'US_bbl_oil/d',
      }
    );

    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
    expect(response[0].datapoints[0].value).toBe('153885');
    expect(response[0].datapoints[1].value).toBe('15388.5');
  });

  test('retrieve latest with conversion', async () => {
    const response = await client.datapoints.retrieveLatest(
      [
        {
          before: '1d-ago',
          id: timeserie.id,
        },
      ],
      {},
      {
        outputUnit: 'US_bbl_oil/d',
      }
    );

    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
    expect(
      unitConverter(response[0].datapoints[0].value, 'ft3/s', 'US_bbl_oil/d')
    ).toBe('2.36805e+8');
    expect(
      unitConverter(response[0].datapoints[0].value, 'ft3/s', 'US_bbl_oil/d', 1)
    ).toBe('2e+8');
  });

  test('failing retrieve latest with conversion', async () => {
    const response = await client.datapoints.retrieveLatest(
      [
        {
          before: '1d-ago',
          id: timeserie.id,
        },
      ],
      {},
      {
        outputUnit: 'degF',
        continueIfConversionFails: true,
      }
    );

    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
    expect(response[0].datapoints[0].value).toBe(1);
    expect(response[0].unit).toBe('ft3/s');
  });

  test('synthetic query', async () => {
    const result = await client.timeseries.syntheticQuery([
      {
        expression: `24 * TS{id=${timeserie.id}}`,
        start: '48h-ago',
        limit: 1,
      },
    ]);
    expect(result.length).toBe(1);
    expect(result[0].datapoints[0].timestamp).toBeInstanceOf(Date);
  });
});
