// Copyright 2025 Cognite AS

import { beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { ContainerCreateDefinition } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('records integration test', () => {
  let client: CogniteClient;

  // Use the existing test streams from streams.int.spec.ts
  const immutableStreamId = 'sdk_test_immutable_stream';

  // Unique space and container
  const testSpaceId = 'sdk_test_records_space';
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

    // Create or upsert the test space
    await vi.waitFor(
      async () =>
        client.spaces.upsert([
          {
            space: testSpaceId,
            name: testSpaceId,
            description: 'Space used for records integration tests.',
          },
        ]),
      {
        timeout: 25 * 1000,
        interval: 1000,
      }
    );

    // Create or upsert a container for records integration tests
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

    await vi.waitFor(
      async () => client.containers.upsert([containerDefinition]),
      {
        timeout: 25 * 1000,
        interval: 1000,
      }
    );

    // Wait for eventual consistency
    await new Promise((resolve) => setTimeout(resolve, 2000));
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

    // Wait for eventual consistency (record should be available at most within 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Filter records by name property
    const result = await client.records.filter(immutableStreamId, {
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

    expect(result.length).toBe(1);

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
});
