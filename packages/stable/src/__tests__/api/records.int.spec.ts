// Copyright 2025 Cognite AS

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ContainerCreateDefinition,
  RecordDelete,
  SyncRecordItem,
} from '../../types';
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
          initializeCursor: '5m-ago',
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

    // Verify nextCursor and hasNext are always available for manual pagination
    expect(result.nextCursor).toBeDefined();
    expect(typeof result.nextCursor).toBe('string');
    expect(typeof result.hasNext).toBe('boolean');

    // The next() function will be defined based on hasNext
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

    // Wait for records to appear and test autoPagingToArray with limit: 1 to force pagination
    const records = await vi.waitFor(
      async () => {
        const items = await client.records
          .sync(immutableStreamId, {
            initializeCursor: '5m-ago',
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
            limit: 1, // Force pagination by using small limit
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
  }, 10_000);

  test('aggregate records with metric aggregates', async () => {
    const testName = `aggregate_metrics_${randomInt()}`;
    const source = {
      type: 'container' as const,
      space: testSpaceId,
      externalId: testContainerId,
    };

    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `agg_1_${randomInt()}`,
        sources: [
          {
            source,
            properties: {
              name: testName,
              value: 100,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `agg_2_${randomInt()}`,
        sources: [
          {
            source,
            properties: {
              name: testName,
              value: 200,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    await vi.waitFor(
      async () => {
        const prop = [testSpaceId, testContainerId, 'value'] satisfies [
          string,
          string,
          string,
        ];
        const aggregates = await client.records.aggregate(immutableStreamId, {
          lastUpdatedTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
          aggregates: {
            totalCount: { count: {} },
            totalSum: { sum: { property: prop } },
            avgValue: { avg: { property: prop } },
            minValue: { min: { property: prop } },
            maxValue: { max: { property: prop } },
          },
        });
        expect((aggregates.totalCount as { count: number }).count).toBe(2);
        expect((aggregates.totalSum as { sum: number }).sum).toBe(300);
        expect((aggregates.avgValue as { avg: number }).avg).toBe(150);
        expect((aggregates.minValue as { min: number }).min).toBe(100);
        expect((aggregates.maxValue as { max: number }).max).toBe(200);
      },
      { timeout: 5_000, interval: 200 }
    );
  });

  test('aggregate records with uniqueValues bucket', async () => {
    const testPrefix = `agg_bucket_${randomInt()}`;
    const cat1 = `${testPrefix}_cat1`;
    const cat2 = `${testPrefix}_cat2`;
    const source = {
      type: 'container' as const,
      space: testSpaceId,
      externalId: testContainerId,
    };

    await client.records.ingest(immutableStreamId, [
      {
        space: testSpaceId,
        externalId: `agg_b1_${randomInt()}`,
        sources: [
          {
            source,
            properties: {
              name: cat1,
              value: 10,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `agg_b2_${randomInt()}`,
        sources: [
          {
            source,
            properties: {
              name: cat1,
              value: 20,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `agg_b3_${randomInt()}`,
        sources: [
          {
            source,
            properties: {
              name: cat2,
              value: 30,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    type BucketResult = {
      uniqueValueBuckets: Array<{
        count: number;
        value: string;
        aggregates?: { catSum: { sum: number } };
      }>;
    };

    await vi.waitFor(
      async () => {
        const aggregates = await client.records.aggregate(immutableStreamId, {
          lastUpdatedTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
          filter: {
            prefix: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testPrefix,
            },
          },
          aggregates: {
            byCat: {
              uniqueValues: {
                property: [testSpaceId, testContainerId, 'name'],
                aggregates: {
                  catSum: {
                    sum: { property: [testSpaceId, testContainerId, 'value'] },
                  },
                },
              },
            },
          },
        });
        const result = aggregates.byCat as BucketResult;
        expect(result.uniqueValueBuckets.length).toBe(2);
        const b1 = result.uniqueValueBuckets.find((b) => b.value === cat1);
        const b2 = result.uniqueValueBuckets.find((b) => b.value === cat2);
        expect(b1?.count).toBe(2);
        expect(b1?.aggregates?.catSum.sum).toBe(30);
        expect(b2?.count).toBe(1);
        expect(b2?.aggregates?.catSum.sum).toBe(30);
      },
      { timeout: 10_000, interval: 500 }
    );
  });
});

describe('mutable records integration test', () => {
  let client: CogniteClient;

  const mutableStreamId = 'sdk_test_mutable_stream';
  // Reuse the same space and container from the immutable records tests
  const testSpaceId = RECORDS_TEST_SPACE;
  const testContainerId = 'sdk_test_records_container';

  // Track records created during tests for cleanup
  const recordsToCleanup: RecordDelete[] = [];

  beforeAll(async () => {
    client = setupLoggedInClient();

    // Check if mutable stream exists, create if not
    try {
      await client.streams.retrieve({ externalId: mutableStreamId });
    } catch {
      await client.streams.create({
        externalId: mutableStreamId,
        settings: {
          template: {
            name: 'BasicLiveData',
          },
        },
      });
    }
  }, 60_000);

  afterAll(async () => {
    // Clean up any records created during tests
    if (recordsToCleanup.length > 0) {
      try {
        await client.records.delete(mutableStreamId, recordsToCleanup);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  test('upsert creates, updates, and delete removes records', async () => {
    const testName = `upsert_lifecycle_${randomInt()}`;
    const recordId = `lifecycle_record_${randomInt()}`;
    const initialValue = 10.0;
    const updatedValue = 99.9;

    const source = {
      type: 'container' as const,
      space: testSpaceId,
      externalId: testContainerId,
    };

    // 1. Create a new record via upsert
    await client.records.upsert(mutableStreamId, [
      {
        space: testSpaceId,
        externalId: recordId,
        sources: [
          {
            source,
            properties: {
              name: testName,
              value: initialValue,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    // Verify the record was created
    const createdRecord = await vi.waitFor(
      async () => {
        const records = await client.records.filter(mutableStreamId, {
          sources: [{ source, properties: ['*'] }],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
        });
        expect(records.length).toBe(1);
        return records[0];
      },
      { timeout: 10_000, interval: 200 }
    );

    expect(createdRecord.space).toBe(testSpaceId);
    expect(createdRecord.externalId).toBe(recordId);
    expect(createdRecord.properties[testSpaceId][testContainerId].value).toBe(
      initialValue
    );

    // 2. Update the record via upsert
    await client.records.upsert(mutableStreamId, [
      {
        space: testSpaceId,
        externalId: recordId,
        sources: [
          {
            source,
            properties: {
              name: testName,
              value: updatedValue,
              timestamp: '2025-01-02T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    // Verify the record was updated
    const updatedRecord = await vi.waitFor(
      async () => {
        const records = await client.records.filter(mutableStreamId, {
          sources: [{ source, properties: ['*'] }],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
        });
        expect(records.length).toBe(1);
        expect(records[0].properties[testSpaceId][testContainerId].value).toBe(
          updatedValue
        );
        return records[0];
      },
      { timeout: 10_000, interval: 200 }
    );

    expect(updatedRecord.externalId).toBe(recordId);

    // 3. Delete the record
    await client.records.delete(mutableStreamId, [
      { space: testSpaceId, externalId: recordId },
    ]);

    // Verify the record is no longer returned by filter
    await vi.waitFor(
      async () => {
        const records = await client.records.filter(mutableStreamId, {
          sources: [{ source, properties: ['*'] }],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
        });
        expect(records.length).toBe(0);
      },
      { timeout: 10_000, interval: 200 }
    );
  }, 30_000);

  test('delete is idempotent (does not error on non-existent records)', async () => {
    const nonExistentRecordId = `non_existent_${randomInt()}`;

    // Deleting a non-existent record should not throw
    await expect(
      client.records.delete(mutableStreamId, [
        { space: testSpaceId, externalId: nonExistentRecordId },
      ])
    ).resolves.toBeUndefined();
  });

  test('sync shows deleted records with deleted status', async () => {
    const testName = `sync_delete_${randomInt()}`;
    const recordId = `sync_delete_record_${randomInt()}`;

    const source = {
      type: 'container' as const,
      space: testSpaceId,
      externalId: testContainerId,
    };

    // Create a record
    await client.records.ingest(mutableStreamId, [
      {
        space: testSpaceId,
        externalId: recordId,
        sources: [
          {
            source,
            properties: {
              name: testName,
              value: 50,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    // Wait for record to be visible via sync with 'created' status
    await vi.waitFor(
      async () => {
        const response = await client.records.sync(mutableStreamId, {
          initializeCursor: '5m-ago',
          sources: [{ source, properties: ['*'] }],
          filter: {
            equals: {
              property: [testSpaceId, testContainerId, 'name'],
              value: testName,
            },
          },
        });
        expect(response.items.length).toBe(1);
        expect(response.items[0].status).toBe('created');
      },
      { timeout: 10_000, interval: 200 }
    );

    // Delete the record
    await client.records.delete(mutableStreamId, [
      { space: testSpaceId, externalId: recordId },
    ]);

    // Verify sync shows the record with 'deleted' status (tombstone)
    await vi.waitFor(
      async () => {
        // Use autoPagingToArray to get all sync items and find the deleted one
        const items = await client.records
          .sync(mutableStreamId, {
            initializeCursor: '5m-ago',
            filter: {
              and: [
                {
                  equals: {
                    property: ['space'],
                    value: testSpaceId,
                  },
                },
                {
                  equals: {
                    property: ['externalId'],
                    value: recordId,
                  },
                },
              ],
            },
          })
          .autoPagingToArray({ limit: 100 });

        // Find the deleted tombstone record
        const deletedRecord = items.find((r) => r.status === 'deleted');
        expect(deletedRecord).toBeDefined();
        expect(deletedRecord?.externalId).toBe(recordId);
        expect(deletedRecord?.space).toBe(testSpaceId);
      },
      { timeout: 10_000, interval: 200 }
    );
  }, 30_000);

  test('sync with manual pagination using hasNext and nextCursor', async () => {
    const testName = `manual_pagination_test_${randomInt()}`;

    // Ingest 3 records to test manual pagination
    await client.records.ingest(mutableStreamId, [
      {
        space: testSpaceId,
        externalId: `manual_pagination_record_1_${randomInt()}`,
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
      {
        space: testSpaceId,
        externalId: `manual_pagination_record_2_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 20,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
      {
        space: testSpaceId,
        externalId: `manual_pagination_record_3_${randomInt()}`,
        sources: [
          {
            source: {
              type: 'container',
              space: testSpaceId,
              externalId: testContainerId,
            },
            properties: {
              name: testName,
              value: 30,
              timestamp: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    ]);

    // Wait for records to be available, then manually paginate
    const allItems = await vi.waitFor(
      async () => {
        const collected: SyncRecordItem[] = [];
        let cursor: string | undefined;

        // Manual pagination loop
        while (true) {
          const response = await client.records.sync(mutableStreamId, {
            ...(cursor ? { cursor } : { initializeCursor: '5m-ago' }),
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
            limit: 1, // Force pagination by using small limit
          });

          // Verify response structure - nextCursor and hasNext should always be defined
          expect(response.nextCursor).toBeDefined();
          expect(typeof response.nextCursor).toBe('string');
          expect(typeof response.hasNext).toBe('boolean');

          collected.push(...response.items);
          cursor = response.nextCursor; // Always store cursor for resumption

          if (!response.hasNext) break;
        }

        expect(collected.length).toBe(3);
        return collected;
      },
      { timeout: 10_000, interval: 200 }
    );

    expect(allItems.length).toBe(3);
    expect(allItems.every((r) => r.status === 'created')).toBe(true);

    // Verify we got all 3 different values
    const values = allItems
      .map((r) => r.properties?.[testSpaceId][testContainerId].value)
      .sort((a, b) => (a as number) - (b as number));
    expect(values).toEqual([10, 20, 30]);
  });
});
