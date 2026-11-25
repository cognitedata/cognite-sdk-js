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

describe('String time series datapoints integration test', () => {
  let client: CogniteClient;

  const timeSeriesId = {
    space: TEST_DATA_SPACE,
    externalId: `string_ts_${randomInt()}`,
  };

  const stringTimeSeries: NodeWrite = {
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
        properties: { type: 'string' },
      },
    ],
  };

  // Aligned to a whole second so each 1s aggregate interval starts at a data point
  const start = Math.floor((Date.now() - 60 * 60 * 1000) / 1000) * 1000;

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.upsert([
      {
        space: TEST_DATA_SPACE,
        name: TEST_DATA_SPACE,
        description: 'Instance space used for integration tests.',
      },
    ]);
    await client.instances.upsert({ items: [stringTimeSeries] });
    await client.timeseries.data.insert([
      {
        instanceId: timeSeriesId,
        datapoints: [
          { timestamp: start, value: 'a' },
          { timestamp: start + 1000, value: 'b' },
          { timestamp: start + 2000, value: 'a' },
        ],
      },
    ]);
  });

  afterAll(async () => {
    await client.instances.delete([{ instanceType: 'node', ...timeSeriesId }]);
  });

  test('retrieve raw string datapoints', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [response] = await client.timeseries.data.retrieve({
        items: [{ instanceId: timeSeriesId, start, end: start + 3000 }],
      });
      expect(response.type).toBe('string');
      expect(response.isString).toBe(true);
      if (response.type !== 'string') return;
      expect(response.datapoints.map((dp) => dp.value)).toEqual([
        'a',
        'b',
        'a',
      ]);
    });
  });

  test('retrieve string aggregates', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [response] = await client.timeseries.data.retrieve({
        items: [{ instanceId: timeSeriesId, start, end: start + 3000 }],
        aggregates: ['count', 'interpolation', 'stepInterpolation'],
        granularity: '1s',
      });
      expect(response.type).toBe('string');
      expect(response.isString).toBe(true);
      if (response.type !== 'string') return;
      const { datapoints } = response;
      expect(datapoints[0].timestamp).toBeInstanceOf(Date);
      expect(datapoints.map((dp) => dp.count)).toEqual([1, 1, 1]);
      expect(datapoints.map((dp) => dp.interpolation)).toEqual(['a', 'b', 'a']);
      expect(datapoints.map((dp) => dp.stepInterpolation)).toEqual([
        'a',
        'b',
        'a',
      ]);
    });
  });
});
