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
  let timeserie2: Timeseries;
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
  const datapoints2 = [
    // Create two data points in October 2022
    {
      timestamp: new Date(2022, 9, 1),
      value: 0,
    },
    {
      timestamp: new Date(2022, 9, 2),
      value: 10,
    },
    // Create two data points in November 2022
    {
      timestamp: new Date(2022, 10, 1),
      value: 20,
    },
    {
      timestamp: new Date(2022, 10, 2),
      value: 30,
    },
    // Create two data points in December 2022
    {
      timestamp: new Date(2022, 11, 1),
      value: 40,
    },
    {
      timestamp: new Date(2022, 11, 2),
      value: 50,
    },
    // Create a missing month in between, populated with data points in Feb 2023
    {
      timestamp: new Date(2023, 1, 1),
      value: 60,
    },
    {
      timestamp: new Date(2023, 1, 2),
      value: 70,
    },
    {
      timestamp: new Date(2023, 2, 1),
      value: 80,
    },
    {
      timestamp: new Date(2023, 2, 2),
      value: 90,
    },
  ];



  beforeAll(async () => {
    client = setupLoggedInClient();
    [timeserie] = await client.timeseries.create([{ name: 'tmp' }]);
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints: datapoints,
      },
    ]);

    [timeserie2] = await client.timeseries.create([{ name: 'tmp2' }]);
    await client.datapoints.insert([
      {
        id: timeserie2.id,
        datapoints: datapoints2,
      },
    ]);
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
    await client.timeseries.delete([{ id: timeserie2.id }]);
  });

  test('retrieve monthly granularity for two consecutive months in same year', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }, { id: timeserie2.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2022, 10, 30),
        aggregates: ['sum'],
      }
    );

    expect(response[0].datapoints.length).toBe(2);
    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70);
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );

    // check that there is two timeseries in the response
    expect(response[1].datapoints.length).toBe(2);
    // Check that the response contains the correct number of data points
    expect((response[1].datapoints[0] as DatapointAggregate).sum).toBe(10);
    expect((response[1].datapoints[1] as DatapointAggregate).sum).toBe(50);
    // Check timestamps
    expect((response[1].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[1].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
  });

  test('retrieve monthly granularity for two consecutive months in different years', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 11, 1),
        end: new Date(2023, 0, 15),
        aggregates: ['sum'],
      }
    );
    expect(response[0].datapoints.length).toBe(2);
    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(110);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(150);
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 0, 1)
    );
  });

  test('retrieve monthly granularity for two non-consecutive months in same year', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2022, 11, 30),
        aggregates: ['sum'],
      }
    );
    expect(response[0].datapoints.length).toBe(3);
    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30);
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70);
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110);
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
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
    expect(response[0].datapoints.length).toBe(5);

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30); // October 2022
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70); // November 2022
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110); // December 2022
    expect((response[0].datapoints[3] as DatapointAggregate).sum).toBe(150); // January 2023
    expect((response[0].datapoints[4] as DatapointAggregate).sum).toBe(190); // March 2023
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
    expect((response[0].datapoints[3] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 0, 1)
    );
    expect((response[0].datapoints[4] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 2, 1)
    );

    expect(response[1].datapoints.length).toBe(5);

    // Check that the response contains the correct number of data points
    expect((response[1].datapoints[0] as DatapointAggregate).sum).toBe(10); // October 2022
    expect((response[1].datapoints[1] as DatapointAggregate).sum).toBe(50); // November 2022
    expect((response[1].datapoints[2] as DatapointAggregate).sum).toBe(90); // December 2022
    expect((response[1].datapoints[3] as DatapointAggregate).sum).toBe(130); // February 2023
    expect((response[1].datapoints[4] as DatapointAggregate).sum).toBe(170); // March 2023
    // Check timestamps
    expect((response[1].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[1].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[1].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
    expect((response[1].datapoints[3] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 1, 1)
    );
    expect((response[0].datapoints[4] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 2, 1)
    );

  });

  test('retrieve monthly granularity for a year when there is missing data for some months', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: Date.parse('2022-01-01T00:00:00Z'),
        end: Date.parse('2022-12-15T23:59:59Z'),
        aggregates: ['sum'],
      }
    );
    expect(response[0].datapoints.length).toBe(3);

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30); // October 2022
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70); // November 2022
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110); // December 2022
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
  });

  test('retrieve monthly average granularity when there is a data gap between months', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: new Date(2022, 9, 1),
        end: new Date(2023, 2, 15),
        aggregates: ['average'],
      }
    );
    expect(response[0].datapoints.length).toBe(5);

    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).average).toBe(15);
    expect((response[0].datapoints[1] as DatapointAggregate).average).toBe(35);
    expect((response[0].datapoints[2] as DatapointAggregate).average).toBe(55);
    expect((response[0].datapoints[3] as DatapointAggregate).average).toBe(75);
    expect((response[0].datapoints[4] as DatapointAggregate).average).toBe(95);
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
    expect((response[0].datapoints[3] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 0, 1)
    );
    expect((response[0].datapoints[4] as DatapointAggregate).timestamp).toEqual(
      new Date(2023, 2, 1)
    );
  });

  test('retrieve monthly granularity with local time zone in start/end - +0100', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: Date.parse('2022-01-01T00:00:00+0100'),
        end: Date.parse('2022-12-12T00:00:00+0100'),
        aggregates: ['sum'],
      }
    );
    expect(response[0].datapoints.length).toBe(3);
    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30); // October 2022
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70); // November 2022
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110); // December 2022
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
  });
  test('retrieve monthly granularity with local time zone in start/end - -0600', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }],
        start: Date.parse('2022-01-01T00:00:00-0600'),
        end: Date.parse('2022-12-12T00:00:00-0600'),
        aggregates: ['sum'],
      }
    );
    expect(response[0].datapoints.length).toBe(3);
    // Check that the response contains the correct number of data points
    expect((response[0].datapoints[0] as DatapointAggregate).sum).toBe(30); // October 2022
    expect((response[0].datapoints[1] as DatapointAggregate).sum).toBe(70); // November 2022
    expect((response[0].datapoints[2] as DatapointAggregate).sum).toBe(110); // December 2022
    // Check timestamps
    expect((response[0].datapoints[0] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 9, 1)
    );
    expect((response[0].datapoints[1] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 10, 1)
    );
    expect((response[0].datapoints[2] as DatapointAggregate).timestamp).toEqual(
      new Date(2022, 11, 1)
    );
  });
});
