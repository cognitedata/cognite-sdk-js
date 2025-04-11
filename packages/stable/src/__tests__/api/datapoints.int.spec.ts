// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { DatapointAggregate, NodeWrite, Timeseries } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Datapoints integration test', () => {
  let client: CogniteClient;
  let timeserie: Timeseries;

  const testSpace = {
    space: 'test_data_space',
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };

  const timeseriesCdmInstance: NodeWrite = {
    externalId: `external_${randomInt()}`,
    space: testSpace.space,
    instanceType: 'node',
    sources: [
      {
        source: {
          externalId: 'CogniteTimeSeries',
          space: 'cdf_cdm',
          type: 'view',
          version: 'v1',
        },
        properties: {
          type: 'numeric',
        },
      },
    ],
  };

  const timeseriesCdmInstanceId = {
    externalId: timeseriesCdmInstance.externalId,
    space: timeseriesCdmInstance.space,
  };

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
    await client.spaces.upsert([testSpace]);
    await client.instances.upsert({
      items: [timeseriesCdmInstance],
    });
  });
  afterAll(async () => {
    await client.timeseries.delete([{ id: timeserie.id }]);
    await client.instances.delete([
      {
        instanceType: 'node',
        externalId: timeseriesCdmInstance.externalId,
        space: timeseriesCdmInstance.space,
      },
    ]);
  });

  test('insert', async () => {
    await client.datapoints.insert([
      {
        id: timeserie.id,
        datapoints,
      },
    ]);
  });

  test('insert by instance id', async () => {
    const res = await client.datapoints.insert([
      {
        instanceId: timeseriesCdmInstanceId,
        datapoints,
      },
    ]);
    expect(res).toEqual({});
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

  test('retrieve by instance id', async () => {
    const response = await client.datapoints.retrieve({
      items: [{ instanceId: timeseriesCdmInstanceId }],
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

  test('retrieve latest by instance id', async () => {
    const response = await client.datapoints.retrieveLatest([
      {
        before: '1d-ago',
        instanceId: timeseriesCdmInstanceId,
      },
    ]);
    expect(response[0].datapoints.length).toBeGreaterThan(0);
    expect(response[0].datapoints[0].timestamp).toBeInstanceOf(Date);
  });

  test('retrieve with cursor', async () => {
    const queryTimeRange = {
      start: '3d-ago',
      end: new Date(),
    };
    const response = await client.datapoints.retrieve({
      items: [{ id: timeserie.id, limit: 1 }],
      ...queryTimeRange,
    });

    expect(response[0].datapoints.length).toBe(1);
    expect(response[0].nextCursor).toBeDefined();

    const nextResponse = await client.datapoints.retrieve({
      items: [{ id: timeserie.id, limit: 1, cursor: response[0].nextCursor }],
      ...queryTimeRange,
    });

    expect(nextResponse[0].datapoints.length).toBe(1);
    expect(nextResponse[0].datapoints).not.toEqual(response);
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

  test('delete by instance id', async () => {
    const res = await client.datapoints.delete([
      {
        instanceId: timeseriesCdmInstanceId,
        inclusiveBegin: 0,
      },
    ]);
    expect(res).toEqual({});
  });
});

describe('Datapoints integration test with chunking', () => {
  let client: CogniteClient;
  let timeseries: Timeseries[];

  beforeAll(async () => {
    client = setupLoggedInClient();
    const externalIdPrefix = 'test-ts-with-one-dp';
    timeseries = await client.timeseries
      .list({
        filter: {
          externalIdPrefix: externalIdPrefix,
        },
      })
      .autoPagingToArray({ limit: 200 });
    if (timeseries.length < 100) {
      timeseries = await client.timeseries.create(
        new Array(200).fill(0).map((_) => ({
          name: externalIdPrefix,
          externalId: `${externalIdPrefix}-${randomInt()}`,
          description: 'Test timeseries with one datapoint',
        }))
      );
      const timestampToWrite = new Date(Date.now() - 1000);
      await client.datapoints.insert(
        timeseries.map(({ id }) => ({
          id,
          datapoints: [
            {
              timestamp: timestampToWrite,
              value: 1,
            },
          ],
        }))
      );
    }
  });

  test('retrieve latest with chunking', async () => {
    const response = await client.datapoints.retrieveLatest(
      timeseries.map(({ id }) => ({ id }))
    );
    expect(response.length).toEqual(timeseries.length);
    expect(response[0].datapoints.every((d) => d.value === 1)).toBeTruthy();
    // expect order to be the same as in the request
    expect(response.map(({ id }) => id)).toEqual(
      timeseries.map(({ id }) => id)
    );
  });
});

describe.skip('Datapoints integration test for monthly granularity', () => {
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
        items: [{ id: timeserie.id }, { id: timeserie2.id }],
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
  test('retrieve monthly granularity with empty result ste', async () => {
    const response = await client.datapoints.retrieveDatapointMonthlyAggregates(
      {
        items: [{ id: timeserie.id }, { id: timeserie2.id }],
        start: new Date(2020, 9, 1),
        end: new Date(2020, 10, 30),
        aggregates: ['sum'],
      }
    );

    expect(response[0].datapoints.length).toBe(0);
    expect(response[1].datapoints.length).toBe(0);
  });
});
