// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('Data point subscriptions integration test', () => {
  let client: CogniteClient;
  let timeseriesExternalId: string;
  let timeseriesId: number;
  const subscriptionExplicitExtId = `sdk_dp_sub_explicit_${randomInt()}`;
  const subscriptionFilterExtId = `sdk_dp_sub_filter_${randomInt()}`;

  beforeAll(async () => {
    client = setupLoggedInClient();
    timeseriesExternalId = `sdk_dp_sub_ts_${randomInt()}`;
    const [ts] = await client.timeseries.create([
      {
        name: 'sdk_datapoint_subscription_ts',
        externalId: timeseriesExternalId,
        isString: false,
      },
    ]);
    timeseriesId = ts.id;
  }, 25_000);

  afterAll(async () => {
    await client.timeseries.subscriptions
      .delete({
        items: [{ externalId: subscriptionExplicitExtId }],
        ignoreUnknownIds: true,
      })
      .catch(() => undefined);
    await client.timeseries.subscriptions
      .delete({
        items: [{ externalId: subscriptionFilterExtId }],
        ignoreUnknownIds: true,
      })
      .catch(() => undefined);
    await client.timeseries.delete([{ id: timeseriesId }]);
  });

  test('create, list, retrieve, filter create, update, members, data, delete', async () => {
    const [createdExplicit] = await client.timeseries.subscriptions.create([
      {
        externalId: subscriptionExplicitExtId,
        partitionCount: 1,
        timeSeriesIds: [timeseriesExternalId],
      },
    ]);
    expect(createdExplicit.externalId).toBe(subscriptionExplicitExtId);
    expect(createdExplicit.partitionCount).toBe(1);
    expect(createdExplicit.createdTime).toBeInstanceOf(Date);

    const listed = await client.timeseries.subscriptions.list({ limit: 100 });
    expect(
      listed.items.some((s) => s.externalId === subscriptionExplicitExtId)
    ).toBe(true);

    const [retrieved] = await client.timeseries.subscriptions.retrieve({
      items: [{ externalId: subscriptionExplicitExtId }],
    });
    expect(retrieved.externalId).toBe(subscriptionExplicitExtId);

    const [createdFilter] = await client.timeseries.subscriptions.create([
      {
        externalId: subscriptionFilterExtId,
        partitionCount: 1,
        filter: {
          equals: {
            property: ['externalId'],
            value: timeseriesExternalId,
          },
        },
      },
    ]);
    expect(createdFilter.externalId).toBe(subscriptionFilterExtId);
    expect(createdFilter.filter).toBeDefined();

    const [updated] = await client.timeseries.subscriptions.update([
      {
        externalId: subscriptionExplicitExtId,
        update: {
          name: { set: `updated_${randomInt()}` },
        },
      },
    ]);
    expect(updated.name).toBeDefined();

    const members = await client.timeseries.subscriptions.listMembers({
      externalId: subscriptionExplicitExtId,
      limit: 100,
    });
    expect(
      members.items.some((m) => m.externalId === timeseriesExternalId)
    ).toBe(true);

    const initial = await client.timeseries.subscriptions.listData({
      externalId: subscriptionExplicitExtId,
      partitions: [{ index: 0 }],
      limit: 10,
      initializeCursors: 'now',
      pollTimeoutSeconds: 0,
    });
    expect(initial.hasNext).toBeDefined();
    expect(Array.isArray(initial.updates)).toBe(true);
    expect(initial.partitions.length).toBeGreaterThanOrEqual(1);
    expect(initial.partitions[0].nextCursor).toBeDefined();

    const datapointTimestamp = Date.now();
    const datapointValue = randomInt();
    await client.datapoints.insert([
      {
        externalId: timeseriesExternalId,
        datapoints: [{ timestamp: datapointTimestamp, value: datapointValue }],
      },
    ]);

    let partitions = initial.partitions.map(({ index, nextCursor }) => ({
      index,
      cursor: nextCursor,
    }));
    let observedValue: number | string | undefined;
    await runTestWithRetryWhenFailing(async () => {
      const next = await client.timeseries.subscriptions.listData({
        externalId: subscriptionExplicitExtId,
        partitions,
        limit: 100,
        pollTimeoutSeconds: 5,
      });
      partitions = next.partitions.map(({ index, nextCursor }) => ({
        index,
        cursor: nextCursor,
      }));
      for (const update of next.updates) {
        for (const upsert of update.upserts ?? []) {
          if (
            upsert.timestamp instanceof Date &&
            upsert.timestamp.getTime() === datapointTimestamp
          ) {
            observedValue = upsert.value;
          }
        }
      }
      expect(observedValue).toBe(datapointValue);
    });

    await client.timeseries.subscriptions.delete({
      items: [{ externalId: subscriptionExplicitExtId }],
    });
  });
});
