// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { NodeWrite } from '../../types';
import {
  TEST_DATA_SPACE,
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('State time series datapoints integration test', () => {
  let client: CogniteClient;

  const stateSetId = {
    space: TEST_DATA_SPACE,
    externalId: `state_set_${randomInt()}`,
  };
  const timeSeriesId = {
    space: TEST_DATA_SPACE,
    externalId: `state_ts_${randomInt()}`,
  };

  const stateSet: NodeWrite = {
    ...stateSetId,
    instanceType: 'node',
    sources: [
      {
        source: {
          externalId: 'CogniteStateSet',
          space: 'cdf_cdm',
          type: 'view',
          version: 'v1',
        },
        properties: {
          states: [
            { numericValue: 0, stringValue: 'CLOSED' },
            { numericValue: 1, stringValue: 'OPEN' },
          ],
        },
      },
    ],
  };

  const stateTimeSeries: NodeWrite = {
    ...timeSeriesId,
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
          type: 'state',
          stateSet: stateSetId,
        },
      },
    ],
  };

  const start = Date.now() - 60 * 60 * 1000;

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.upsert([
      {
        space: TEST_DATA_SPACE,
        name: TEST_DATA_SPACE,
        description: 'Instance space used for integration tests.',
      },
    ]);
    await client.instances.upsert({ items: [stateSet] });
    await client.instances.upsert({ items: [stateTimeSeries] });
  });

  afterAll(async () => {
    await client.instances.delete([
      { instanceType: 'node', ...timeSeriesId },
      { instanceType: 'node', ...stateSetId },
    ]);
  });

  test('insert state datapoints', async () => {
    const res = await client.datapoints.insert([
      {
        instanceId: timeSeriesId,
        datapoints: [
          { timestamp: start, numericValue: 0 },
          { timestamp: start + 1000, stringValue: 'OPEN' },
          { timestamp: start + 2000, numericValue: 0, stringValue: 'CLOSED' },
        ],
      },
    ]);
    expect(res).toEqual({});
  });

  test('retrieve raw state datapoints', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [response] = await client.datapoints.retrieve({
        items: [{ instanceId: timeSeriesId, start, end: start + 3000 }],
      });
      expect(response.type).toBe('state');
      expect(response.isString).toBe(false);
      if (response.type !== 'state') return;
      const { datapoints } = response;
      expect(datapoints).toHaveLength(3);
      expect(datapoints[0].timestamp).toBeInstanceOf(Date);
      expect(datapoints.map((dp) => [dp.numericValue, dp.stringValue])).toEqual(
        [
          [0, 'CLOSED'],
          [1, 'OPEN'],
          [0, 'CLOSED'],
        ]
      );
    });
  });

  test('retrieve latest state datapoint', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [response] = await client.datapoints.retrieveLatest([
        { instanceId: timeSeriesId, before: 'now' },
      ]);
      expect(response.type).toBe('state');
      if (response.type !== 'state') return;
      expect(response.datapoints[0]).toMatchObject({
        numericValue: 0,
        stringValue: 'CLOSED',
      });
    });
  });
  test('retrieve state aggregates', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [response] = await client.timeseries.data.retrieve({
        items: [{ instanceId: timeSeriesId, start, end: start + 3000 }],
        aggregates: [
          'count',
          'stateCount',
          'stateTransitions',
          'stateDuration',
        ],
        granularity: '1h',
      });
      expect(response.type).toBe('state');
      if (response.type !== 'state') return;
      const { datapoints } = response;
      expect(datapoints.length).toBeGreaterThan(0);
      expect(datapoints[0].timestamp).toBeInstanceOf(Date);
      // The three points may straddle an hour boundary, so sum over intervals
      const totals = new Map<
        number,
        { count: number; transitions: number; duration: number }
      >();
      let count = 0;
      for (const dp of datapoints) {
        count += dp.count ?? 0;
        for (const state of dp.stateAggregates ?? []) {
          const total = totals.get(state.numericValue) ?? {
            count: 0,
            transitions: 0,
            duration: 0,
          };
          total.count += state.stateCount ?? 0;
          total.transitions += state.stateTransitions ?? 0;
          total.duration += state.stateDuration ?? 0;
          totals.set(state.numericValue, total);
        }
      }
      expect(count).toBe(3);
      expect(totals.get(0)).toMatchObject({ count: 2, transitions: 2 });
      expect(totals.get(1)).toEqual({
        count: 1,
        transitions: 1,
        duration: 1000,
      });
    });
  });
});
