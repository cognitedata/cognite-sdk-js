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

describe('Datapoints gap filling integration test', () => {
  let client: CogniteClient;

  const instanceId = {
    space: TEST_DATA_SPACE,
    externalId: `gap_fill_ts_${randomInt()}`,
  };

  const timeSeries: NodeWrite = {
    ...instanceId,
    instanceType: 'node',
    sources: [
      {
        source: {
          externalId: 'CogniteTimeSeries',
          space: 'cdf_cdm',
          type: 'view',
          version: 'v1',
        },
        properties: { type: 'numeric', isStep: false },
      },
    ],
  };

  const t0 = Date.UTC(2023, 0, 1);
  const hour = 60 * 60 * 1000;

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.upsert([
      {
        space: TEST_DATA_SPACE,
        name: TEST_DATA_SPACE,
        description: 'Instance space used for integration tests.',
      },
    ]);
    await client.instances.upsert({ items: [timeSeries] });
    // A 2h gap (within the limit), followed by a 5h gap (exceeding it)
    await client.timeseries.data.insert([
      {
        instanceId,
        datapoints: [
          { timestamp: t0 + hour, value: 1 },
          { timestamp: t0 + 3 * hour, value: 3 },
          { timestamp: t0 + 8 * hour, value: 8 },
        ],
      },
    ]);
  });

  afterAll(async () => {
    await client.instances.delete([{ instanceType: 'node', ...instanceId }]);
  });

  test('retrieve with fill', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const [noFill, withFill] = await client.timeseries.data.retrieve({
        items: [{ instanceId }, { instanceId, fill: { limit: '3h' } }],
        start: t0,
        // Well past the last point plus the limit, so the carry-forward has to stop on its own
        end: t0 + 14 * hour,
        aggregates: ['interpolation'],
        granularity: '1h',
      });
      if (noFill.type !== 'numeric' || withFill.type !== 'numeric') {
        throw new Error('Expected numeric aggregates');
      }
      const timestamps = (dps: typeof noFill.datapoints) =>
        dps.map((dp) => dp.timestamp.getTime());

      expect(timestamps(noFill.datapoints)).toEqual(
        [1, 3, 8].map((h) => t0 + h * hour)
      );
      expect(noFill.datapoints.map((dp) => dp.interpolation)).toEqual([
        1, 3, 8,
      ]);
      // The 2h gap is interpolated and the 5h gap is left out. The last value is carried
      // forward up to the limit (8h + 3h), and nothing is returned after that
      expect(timestamps(withFill.datapoints)).toEqual(
        [1, 2, 3, 8, 9, 10, 11].map((h) => t0 + h * hour)
      );
      expect(withFill.datapoints.map((dp) => dp.interpolation)).toEqual([
        1, 2, 3, 8, 8, 8, 8,
      ]);
    });
  });
});
