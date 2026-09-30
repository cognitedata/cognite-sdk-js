// Copyright 2026 Cognite AS

import type { StateDatapointAggregates, StateDatapoints } from '@cognite/sdk';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import {
  randomInt,
  runTestWithRetryWhenFailing,
} from '../../../../core/src/__tests__/testUtils';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

vi.setConfig({ testTimeout: 30_000 });

// Instances are per-run to avoid collisions in concurrent CI
// The shared space is upserted idempotently and never deleted
const RUN_SUFFIX = randomInt();
const SPACE = 'sdk-beta-state-ts-test';
const STATE_SET_EXT_ID = `sdk-beta-pump-states-${RUN_SUFFIX}`;
const PUMP_A_EXT_ID = `sdk-beta-pump-a-state-${RUN_SUFFIX}`;
const PUMP_B_EXT_ID = `sdk-beta-pump-b-state-${RUN_SUFFIX}`;

const BASE_TS = new Date('2025-01-15T00:00:00Z').getTime();
const END_TS = new Date('2025-01-17T00:00:00Z').getTime();
const ts = (hours: number) => BASE_TS + Math.round(hours * 60 * 60 * 1000);

const pumpADatapoints = [
  // `value` is the compatibility alias; the SDK must send it as numericValue
  { timestamp: ts(0), value: 2, stringValue: 'STANDBY' },
  { timestamp: ts(6), numericValue: 1, stringValue: 'RUNNING' },
  { timestamp: ts(10), numericValue: 3, stringValue: 'ERROR' },
  { timestamp: ts(10.5), numericValue: 1, stringValue: 'RUNNING' },
  { timestamp: ts(14), numericValue: 4, stringValue: 'MAINTENANCE' },
  { timestamp: ts(16), numericValue: 1, stringValue: 'RUNNING' },
  { timestamp: ts(22), numericValue: 0, stringValue: 'OFF' },
];

const pumpBDatapoints = [
  { timestamp: ts(0), numericValue: 0, stringValue: 'OFF' },
  { timestamp: ts(6), numericValue: 2, stringValue: 'STANDBY' },
  { timestamp: ts(10), numericValue: 1, stringValue: 'RUNNING' },
  { timestamp: ts(10.5), numericValue: 2, stringValue: 'STANDBY' },
  { timestamp: ts(14), numericValue: 1, stringValue: 'RUNNING' },
  { timestamp: ts(16), numericValue: 2, stringValue: 'STANDBY' },
  { timestamp: ts(22), numericValue: 0, stringValue: 'OFF' },
];

const cdmView = (externalId: string) => ({
  type: 'view' as const,
  space: 'cdf_cdm',
  externalId,
  version: 'v1',
});

const stateTimeSeriesNode = (externalId: string, name: string) => ({
  space: SPACE,
  externalId,
  instanceType: 'node' as const,
  sources: [
    {
      source: cdmView('CogniteTimeSeries'),
      properties: {
        name,
        type: 'state',
        isStep: true,
        stateSet: { space: SPACE, externalId: STATE_SET_EXT_ID },
      },
    },
  ],
});

describe('State time series datapoints integration test', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();

    await client.spaces.upsert([
      { space: SPACE, name: 'SDK beta integration test space' },
    ]);

    await client.instances.upsert({
      items: [
        {
          space: SPACE,
          externalId: STATE_SET_EXT_ID,
          instanceType: 'node',
          sources: [
            {
              source: cdmView('CogniteStateSet'),
              properties: {
                name: 'Pump Operating States',
                states: [
                  { numericValue: 0, stringValue: 'OFF' },
                  { numericValue: 1, stringValue: 'RUNNING' },
                  { numericValue: 2, stringValue: 'STANDBY' },
                  { numericValue: 3, stringValue: 'ERROR' },
                  { numericValue: 4, stringValue: 'MAINTENANCE' },
                ],
              },
            },
          ],
        },
        stateTimeSeriesNode(PUMP_A_EXT_ID, 'Pump A Operating State'),
        stateTimeSeriesNode(PUMP_B_EXT_ID, 'Pump B Operating State'),
      ],
    });
  });

  afterAll(async () => {
    await client.instances.delete([
      { instanceType: 'node', space: SPACE, externalId: PUMP_A_EXT_ID },
      { instanceType: 'node', space: SPACE, externalId: PUMP_B_EXT_ID },
      { instanceType: 'node', space: SPACE, externalId: STATE_SET_EXT_ID },
    ]);
  });

  test('insert state datapoints for two pumps', async () => {
    await client.datapoints.insert([
      {
        instanceId: { space: SPACE, externalId: PUMP_A_EXT_ID },
        datapoints: pumpADatapoints,
      },
      {
        instanceId: { space: SPACE, externalId: PUMP_B_EXT_ID },
        datapoints: pumpBDatapoints,
      },
    ]);
  });

  test('retrieve raw state datapoints', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.datapoints.retrieve({
        items: [
          {
            instanceId: { space: SPACE, externalId: PUMP_A_EXT_ID },
            start: BASE_TS,
            end: END_TS,
          },
          {
            instanceId: { space: SPACE, externalId: PUMP_B_EXT_ID },
            start: BASE_TS,
            end: END_TS,
          },
        ],
      });

      expect(result).toHaveLength(2);

      const pumpA = result[0] as StateDatapoints;
      expect(pumpA.type).toBe('state');
      expect(pumpA.datapoints).toHaveLength(pumpADatapoints.length);
      // Inserted via the deprecated `value` alias, stored as numericValue
      expect(pumpA.datapoints[0].numericValue).toBe(2);
      expect(pumpA.datapoints[0].stringValue).toBe('STANDBY');
      // numericValue is mirrored into the deprecated `value` field (even 0)
      expect(pumpA.datapoints[0].value).toBe(2);

      const pumpB = result[1] as StateDatapoints;
      expect(pumpB.type).toBe('state');
      expect(pumpB.datapoints[0].stringValue).toBe('OFF');
      expect(pumpB.datapoints[0].value).toBe(0);
    });
  });

  test('retrieve state aggregates (stateCount, stateDuration, stateTransitions)', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.datapoints.retrieve({
        items: [
          {
            instanceId: { space: SPACE, externalId: PUMP_A_EXT_ID },
            start: BASE_TS,
            end: END_TS,
          },
        ],
        aggregates: ['stateCount', 'stateDuration', 'stateTransitions'],
        granularity: '1d',
      });

      expect(result).toHaveLength(1);

      const pumpA = result[0] as StateDatapointAggregates;
      expect(pumpA.type).toBe('state');
      expect(pumpA.datapoints.length).toBeGreaterThan(0);

      const [firstBucket] = pumpA.datapoints;
      expect(firstBucket.stateAggregates).toBeDefined();
      expect(firstBucket.stateAggregates?.length).toBeGreaterThan(0);

      const runningAgg = firstBucket.stateAggregates?.find(
        (s) => s.stringValue === 'RUNNING'
      );
      expect(runningAgg).toBeDefined();
      expect(runningAgg?.stateCount).toBeGreaterThan(0);
      expect(runningAgg?.stateDuration).toBeGreaterThan(0);
      expect(runningAgg?.stateTransitions).toBeGreaterThan(0);
    });
  });

  test('retrieveLatest returns the most recent state datapoint', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.datapoints.retrieveLatest([
        {
          instanceId: { space: SPACE, externalId: PUMP_A_EXT_ID },
          before: new Date(END_TS),
        },
      ]);

      expect(result).toHaveLength(1);
      const pumpA = result[0] as StateDatapoints;
      expect(pumpA.type).toBe('state');
      expect(pumpA.datapoints).toHaveLength(1);
      // Last datapoint is OFF at 22h; `value` is mirrored here too
      expect(pumpA.datapoints[0].timestamp).toEqual(new Date(ts(22)));
      expect(pumpA.datapoints[0].numericValue).toBe(0);
      expect(pumpA.datapoints[0].stringValue).toBe('OFF');
      expect(pumpA.datapoints[0].value).toBe(0);
    });
  });
});
