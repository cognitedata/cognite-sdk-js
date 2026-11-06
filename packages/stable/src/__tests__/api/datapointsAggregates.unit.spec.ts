// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, expectTypeOf, test } from 'vitest';
import type {
  Aggregate,
  AggregateDatapointsMultiQuery,
  AnyDatapointAggregates,
  CogniteClient,
  Datapoints,
} from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Datapoint aggregates unit test', () => {
  let client: CogniteClient;
  const instanceId = { space: 'my-space', externalId: 'my-ts' };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('retrieve state aggregates', async () => {
    const query: AggregateDatapointsMultiQuery = {
      items: [{ instanceId }],
      aggregates: [
        'interpolation',
        'stateCount',
        'stateTransitions',
        'stateDuration',
      ],
      granularity: '1h',
    };
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/list$/, matches(query))
      .once()
      .reply(200, {
        items: [
          {
            id: 1,
            instanceId,
            isString: false,
            isStep: true,
            type: 'state',
            datapoints: [
              {
                timestamp: 3600000,
                interpolation: { numericValue: 0, stringValue: 'CLOSED' },
                stateAggregates: [
                  {
                    numericValue: 0,
                    stringValue: 'CLOSED',
                    stateCount: 2,
                    stateTransitions: 1,
                    stateDuration: 1800000,
                  },
                  {
                    numericValue: 1,
                    stateCount: 1,
                    stateTransitions: 1,
                    stateDuration: 1800000,
                  },
                ],
              },
            ],
          },
        ],
      });
    const [response] = await client.timeseries.data.retrieve(query);
    expect(response.type).toBe('state');
    if (response.type !== 'state') return;
    expect(response.datapoints).toEqual([
      {
        timestamp: new Date(3600000),
        interpolation: { numericValue: 0, stringValue: 'CLOSED' },
        stateAggregates: [
          {
            numericValue: 0,
            stringValue: 'CLOSED',
            stateCount: 2,
            stateTransitions: 1,
            stateDuration: 1800000,
          },
          {
            numericValue: 1,
            stateCount: 1,
            stateTransitions: 1,
            stateDuration: 1800000,
          },
        ],
      },
    ]);
  });

  test('retrieve string aggregates', async () => {
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/list$/)
      .once()
      .reply(200, {
        items: [
          {
            id: 1,
            instanceId,
            isString: true,
            isStep: false,
            type: 'string',
            datapoints: [{ timestamp: 1000, count: 2, interpolation: 'OK' }],
          },
        ],
      });
    const [response] = await client.timeseries.data.retrieve({
      items: [{ instanceId }],
      aggregates: ['count', 'interpolation'],
      granularity: '1s',
    });
    expect(response.type).toBe('string');
    expect(response.isString).toBe(true);
    expect(response.datapoints).toEqual([
      { timestamp: new Date(1000), count: 2, interpolation: 'OK' },
    ]);
  });

  test('retrieve keeps the status of min/max data points', async () => {
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/list$/)
      .once()
      .reply(200, {
        items: [
          {
            id: 1,
            instanceId,
            isString: false,
            isStep: false,
            type: 'numeric',
            datapoints: [
              {
                timestamp: 0,
                maxDatapoint: {
                  timestamp: 500,
                  value: 9,
                  status: { code: 1073741824, symbol: 'Uncertain' },
                },
              },
            ],
          },
        ],
      });
    const [response] = await client.timeseries.data.retrieve({
      items: [{ instanceId, includeStatus: true }],
      aggregates: ['maxDatapoint'],
      granularity: '1h',
    });
    expect(response.type).toBe('numeric');
    if (response.type !== 'numeric') return;
    expect(response.datapoints[0].maxDatapoint).toEqual({
      timestamp: new Date(500),
      value: 9,
      status: { code: 1073741824, symbol: 'Uncertain' },
    });
  });
  test('retrieve overloads type the result from the query', () => {
    // Only type-checked: the calls are never run
    const typeChecks = () => {
      const { retrieve } = client.timeseries.data;
      expectTypeOf(
        retrieve({ items: [{ instanceId }] })
      ).resolves.toEqualTypeOf<Datapoints[]>();
      expectTypeOf(
        retrieve({ items: [{ instanceId }], aggregates: ['count'] })
      ).resolves.toEqualTypeOf<AnyDatapointAggregates[]>();
      expectTypeOf(
        retrieve({ items: [{ instanceId, aggregates: ['stateCount'] }] })
      ).resolves.toEqualTypeOf<AnyDatapointAggregates[]>();
      // An item overriding with an empty list returns raw data points
      expectTypeOf(
        retrieve({
          items: [{ instanceId, aggregates: [] }],
          aggregates: ['count'],
        })
      ).resolves.toEqualTypeOf<AnyDatapointAggregates[] | Datapoints[]>();
      // A list that may be empty can't be told apart from raw
      const aggregates: Aggregate[] = ['count'];
      expectTypeOf(
        retrieve({ items: [{ instanceId }], aggregates })
      ).resolves.toEqualTypeOf<AnyDatapointAggregates[] | Datapoints[]>();
    };
    expect(typeChecks).toBeTypeOf('function');
  });
});
