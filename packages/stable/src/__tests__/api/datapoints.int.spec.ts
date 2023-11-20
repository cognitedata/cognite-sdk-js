// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { DatapointAggregate, Timeseries } from '../../types';
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

describe('Datapoints integration test for monthly granularity', () => {
  let client: CogniteClient;
  let timeserie: Timeseries;

  const datapoints = [
    // Create two data points in October 2022
    {
      timestamp: new Date(2022, 9, 1),
      value: 10,
    },
    {
      timestamp: new Date(2022, 9, 2),
      value: 20,
    },
    // Create two data points in November 2022
    {
      timestamp: new Date(2022, 10, 1),
      value: 30,
    },
    {
      timestamp: new Date(2022, 10, 2),
      value: 40,
    },
    // Create two data points in December 2022
    {
      timestamp: new Date(2022, 11, 1),
      value: 50,
    },
    {
      timestamp: new Date(2022, 11, 2),
      value: 60,
    },
    // Create two data points in January 2023
    {
      timestamp: new Date(2023, 0, 1),
      value: 70,
    },
    {
      timestamp: new Date(2023, 0, 2),
      value: 80,
    },
    // Create a missing month in between, populated with data points in March 2023
    {
      timestamp: new Date(2023, 2, 1),
      value: 90,
    },
    {
      timestamp: new Date(2023, 2, 2),
      value: 100,
    },
  ];

  beforeAll(async () => {
    client = setupLoggedInClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints,
      },
    ]);
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
  });

  test('retrieve monthly granularity for two consecutive months in same year', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2022, 10, 15),
        aggregates: ['sum'],
      }
    );

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30);
  });

  test('retrieve monthly granularity for two consecutive months in different years', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 11, 1),
        end: new Date(2023, 2, 15),
        aggregates: ['sum'],
      }
    );

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(110);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(150);
  });

  test('retrieve monthly granularity for two non-consecutive months in same year', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2022, 11, 15),
        aggregates: ['sum'],
      }
    );

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70);
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110);
  });

  test('retrieve monthly granularity when there is a data gap between months', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2023, 2, 15),
        aggregates: ['sum'],
      }
    );

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70);
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110);
    expect((response[0].datapoints[3] as DatapointAggregate).sum).toBe(150);
  });
});
