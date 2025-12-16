// Copyright 2025 Cognite AS

import { beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { ContainerCreateDefinition } from '../../types';
import {
  RECORDS_TEST_SPACE,
  randomInt,
  setupLoggedInClient,
} from '../testUtils';

describe('records integration test', () => {
  let client: CogniteClient;

  // Use the existing test streams from streams.int.spec.ts
  const immutableStreamId = 'sdk_test_immutable_stream';

  // Reusable space and container
  const testSpaceId = RECORDS_TEST_SPACE;
  const testContainerId = 'sdk_test_records_container';

  beforeAll(async () => {
    client = setupLoggedInClient();

    // Check if stream exists, create if not
    try {
      await client.streams.retrieve({ externalId: immutableStreamId });
    } catch {
      await client.streams.create({
        externalId: immutableStreamId,
        settings: {
          template: {
            name: 'ImmutableTestStream',
          },
        },
      });
    }

    // Check if container already exists (which means space also exists)
    try {
      await client.containers.retrieve([
        { space: testSpaceId, externalId: testContainerId },
      ]);
    } catch {
      // Container doesn't exist, need to create space and container
      // Create the test space if it doesn't exist (upsert is idempotent)
      await client.spaces.upsert([
        {
          space: testSpaceId,
          name: testSpaceId,
          description: 'Space used for records integration tests.',
        },
      ]);

      // Create the container for records tests
      const containerDefinition: ContainerCreateDefinition = {
        externalId: testContainerId,
        space: testSpaceId,
        name: 'Test Records Container',
        description: 'Container used for records integration tests.',
        usedFor: 'record',
        properties: {
          name: {
            type: { type: 'text' },
          },
          value: {
            type: { type: 'float64' },
          },
          timestamp: {
            type: { type: 'timestamp' },
          },
        },
      };

      await client.containers.upsert([containerDefinition]);
    }
  }, 60_000);

  test('ingest and filter records', async () => {
    const testName = `test_record_${randomInt()}`;
    const testValue = 42.5;

    // Ingest a record
    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `test_record_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container' as const,
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: testValue,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    // Wait for eventual consistency
    const result = await vi.waitFor(
      async () => {
        const records = await client.records.filter(immutableStreamId, {
          lastUpdatedTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
          },
          sources: [
            {
              source: {
                type: 'container',
                space: testSpaceId,
                externalId: testContainerId,
              },
              properties: ['*'],
            },
          ],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
          limit: 10,
        });
        expect(records.length).toBe(1);
        return records;
      },
      { timeout: 5_000, interval: 200 }
    );

    const record = result[0];
    expect(record.space).toBe(testSpaceId);
    expect(record.externalId).toBeDefined();
    expect(record.createdTime).toBeInstanceOf(Date);
    expect(record.lastUpdatedTime).toBeInstanceOf(Date);
    expect(record.properties).toBeDefined();
    expect(record.properties[testSpaceId]).toBeDefined();
    expect(record.properties[testSpaceId][testContainerId]).toBeDefined();
    expect(record.properties[testSpaceId][testContainerId].name).toBe(testName);
    expect(record.properties[testSpaceId][testContainerId].value).toBe(
      testValue
    );
  });

  test('filter with range', async () => {
    const testName = `range_test_${randomInt()}`;
    const testValue = 75.0;

    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `range_record_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: testValue,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    const result = await vi.waitFor(
      async () => {
        const records = await client.records.filter(immutableStreamId, {
          lastUpdatedTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          sources: [
            {
              source: {
                type: 'container',
                space: testSpaceId,
                externalId: testContainerId,
              },
              properties: ['*'],
            },
          ],
          filter: {
            and: [
              {
                equals: {
                  property: [testSpaceId, testContainerId, 'name'],
                  value: testName,
                },
              },
              {
                range: {
                  property: [testSpaceId, testContainerId, 'value'],
                  gte: 50,
                  lte: 100,
                },
              },
            ],
          },
        });
        expect(records.length).toBe(1);
        return records;
      },
      { timeout: 5_000, interval: 200 }
    );

    expect(result[0].properties[testSpaceId][testContainerId].value).toBe(
      testValue
    );
  });

  test('filter with prefix', async () => {
    const uniquePrefix = `prefix_${randomInt()}`;
    const testName = `${uniquePrefix}_record`;

    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `prefix_record_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 10,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    const result = await vi.waitFor(
      async () => {
        const records = await client.records.filter(immutableStreamId, {
          lastUpdatedTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          sources: [
            {
              source: {
                type: 'container',
                space: testSpaceId,
                externalId: testContainerId,
              },
              properties: ['*'],
            },
          ],
          filter: {
            prefix: {
              property: [testSpaceId, testContainerId, 'name'],
              value: uniquePrefix,
            },
          },
        });
        expect(records.length).toBe(1);
        return records;
      },
      { timeout: 5_000, interval: 200 }
    );

    expect(result[0].properties[testSpaceId][testContainerId].name).toBe(
      testName
    );
  });

  test('sync records', async () => {
    const testName = `sync_test_${randomInt()}`;

    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `sync_record_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 99,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    const result = await vi.waitFor(
      async () => {
        const response = await client.records.sync(immutableStreamId, {
          initializeCursor: '1d-ago',
          sources: [
            {
              source: {
                type: 'container',
                space: testSpaceId,
                externalId: testContainerId,
              },
              properties: ['*'],
            },
          ],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
          limit: 10,
        });
        expect(response.items.length).toBe(1);
        return response;
      },
      { timeout: 5_000, interval: 200 }
    );

    // The next() function will be defined if nextCursor is present
    expect(typeof result.next === 'function' || result.next === undefined).toBe(
      true
    );
    const record = result.items[0];
    expect(record.space).toBe(testSpaceId);
    expect(record.status).toBe('created');
    expect(record.createdTime).toBeInstanceOf(Date);
    expect(record.lastUpdatedTime).toBeInstanceOf(Date);
    expect(record.properties?.[testSpaceId][testContainerId].name).toBe(
      testName
    );
  });

  test('sync records with autoPagingToArray', async () => {
    const testName = `autopaging_test_${randomInt()}`;

    // Ingest 3 records to test pagination across multiple pages
    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `autopaging_record_1_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 1,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `autopaging_record_2_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 2,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `autopaging_record_3_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 3,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    const records = await vi.waitFor(
      async () => {
        // Use limit: 1 to force multiple pages and verify cursor exhaustion
        const items = await client.records
          .sync(immutableStreamId, {
            initializeCursor: '1d-ago',
            sources: [
              {
                source: {
                  type: 'container',
                  space: testSpaceId,
                  externalId: testContainerId,
                },
                properties: ['*'],
              },
            ],
            filter: {
              equals: {
                property: [testSpaceId, testContainerId, 'name'],
                value: testName,
              },
            },
            limit: 1,
          })
          .autoPagingToArray({ limit: 100 });
        expect(items.length).toBe(3);
        return items;
      },
      { timeout: 5_000, interval: 200 }
    );

    expect(records.length).toBe(3);
    expect(records.every((r) => r.status === 'created')).toBe(true);
    expect(
      records.every(
        (r) => r.properties?.[testSpaceId][testContainerId].name === testName
      )
    ).toBe(true);
    // Verify we got all 3 different values
    const values = records
      .map((r) => r.properties?.[testSpaceId][testContainerId].value)
      .sort();
    expect(values).toEqual([1, 2, 3]);
  });

  test('aggregate records with metric aggregates', async () => {
    const testName = `aggregate_metrics_${randomInt()}`;
    const source = { type: 'container' as const, space: testSpaceId, externalId: testContainerId };

    await client.records.ingest(immutableStreamId, [
      { space: testSpaceId, externalId: `agg_1_${randomInt()}`, sources: [{ source, properties: { name: testName, value: 100, timestamp: '2025-01-01T00:00:00.000Z' } }] },
      { space: testSpaceId, externalId: `agg_2_${randomInt()}`, sources: [{ source, properties: { name: testName, value: 200, timestamp: '2025-01-01T00:00:00.000Z' } }] },
    ]);

    await vi.waitFor(async () => {
      const prop = [testSpaceId, testContainerId, 'value'] as [string, string, string];
      const aggregates = await client.records.aggregate(immutableStreamId, {
        lastUpdatedTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        filter: { equals: { property: [testSpaceId, testContainerId, 'name'], value: testName } },
        aggregates: {
          total_count: { count: {} },
          total_sum: { sum: { property: prop } },
          avg_value: { avg: { property: prop } },
          min_value: { min: { property: prop } },
          max_value: { max: { property: prop } },
        },
      });
      expect((aggregates.total_count as { count: number }).count).toBe(2);
      expect((aggregates.total_sum as { sum: number }).sum).toBe(300);
      expect((aggregates.avg_value as { avg: number }).avg).toBe(150);
      expect((aggregates.min_value as { min: number }).min).toBe(100);
      expect((aggregates.max_value as { max: number }).max).toBe(200);
    }, { timeout: 5_000, interval: 200 });
  });

  test('aggregate records with uniqueValues bucket', async () => {
    const testPrefix = `agg_bucket_${randomInt()}`;
    const cat1 = `${testPrefix}_cat1`, cat2 = `${testPrefix}_cat2`;
    const source = { type: 'container' as const, space: testSpaceId, externalId: testContainerId };

    await client.records.ingest(immutableStreamId, [
      { space: testSpaceId, externalId: `agg_b1_${randomInt()}`, sources: [{ source, properties: { name: cat1, value: 10, timestamp: '2025-01-01T00:00:00.000Z' } }] },
      { space: testSpaceId, externalId: `agg_b2_${randomInt()}`, sources: [{ source, properties: { name: cat1, value: 20, timestamp: '2025-01-01T00:00:00.000Z' } }] },
      { space: testSpaceId, externalId: `agg_b3_${randomInt()}`, sources: [{ source, properties: { name: cat2, value: 30, timestamp: '2025-01-01T00:00:00.000Z' } }] },
    ]);

    type BucketResult = { uniqueValueBuckets: Array<{ count: number; value: string; aggregates?: { cat_sum: { sum: number } } }> };

    await vi.waitFor(async () => {
      const aggregates = await client.records.aggregate(immutableStreamId, {
        lastUpdatedTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        filter: { prefix: { property: [testSpaceId, testContainerId, 'name'], value: testPrefix } },
        aggregates: {
          by_cat: { uniqueValues: { property: [testSpaceId, testContainerId, 'name'], aggregates: { cat_sum: { sum: { property: [testSpaceId, testContainerId, 'value'] } } } } },
        },
      });
      const result = aggregates.by_cat as BucketResult;
      expect(result.uniqueValueBuckets.length).toBe(2);
      const b1 = result.uniqueValueBuckets.find((b) => b.value === cat1);
      const b2 = result.uniqueValueBuckets.find((b) => b.value === cat2);
      expect(b1?.count).toBe(2);
      expect(b1?.aggregates?.cat_sum.sum).toBe(30);
      expect(b2?.count).toBe(1);
      expect(b2?.aggregates?.cat_sum.sum).toBe(30);
    }, { timeout: 10_000, interval: 500 });
  });
});
