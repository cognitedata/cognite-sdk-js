// Copyright 2025 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('streams integration test', () => {
  let client: CogniteClient;

  // Persistent streams for testing
  const immutableStreamId = 'sdk_test_immutable_stream';
  const mutableStreamId = 'sdk_test_mutable_stream';

  beforeAll(async () => {
    client = setupLoggedInClient();

    const existingStreams = await client.streams.list();
    const existingIds = existingStreams.map((s) => s.externalId);

    if (!existingIds.includes(immutableStreamId)) {
      await client.streams.create({
        externalId: immutableStreamId,
        settings: {
          template: {
            name: 'ImmutableTestStream',
          },
        },
      });
    }

    if (!existingIds.includes(mutableStreamId)) {
      await client.streams.create({
        externalId: mutableStreamId,
        settings: {
          template: {
            name: 'BasicLiveData',
          },
        },
      });
    }
  });

  test('list streams', async () => {
    const streams = await client.streams.list();
    expect(Array.isArray(streams)).toBe(true);
    expect(streams.length).toBeGreaterThan(0);

    // Verify both test streams exist with proper types
    const immutableStream = streams.find(
      (s) => s.externalId === immutableStreamId
    );
    const mutableStream = streams.find((s) => s.externalId === mutableStreamId);

    expect(immutableStream).toBeDefined();
    expect(immutableStream?.createdTime).toBeInstanceOf(Date);
    expect(immutableStream?.settings).toBeDefined();
    expect(immutableStream?.type).toBe('Immutable');

    expect(mutableStream).toBeDefined();
    expect(mutableStream?.createdTime).toBeInstanceOf(Date);
    expect(mutableStream?.settings).toBeDefined();
    expect(mutableStream?.type).toBe('Mutable');
  });

  test('retrieve stream without statistics', async () => {
    const retrieved = await client.streams.retrieve({
      externalId: immutableStreamId,
    });
    expect(retrieved.externalId).toBe(immutableStreamId);
    expect(retrieved.createdTime).toBeInstanceOf(Date);
    expect(retrieved.type).toBe('Immutable');
    expect(retrieved.settings.limits.maxRecordsTotal.provisioned).toBeDefined();
    // consumed should not be present without includeStatistics
    expect(retrieved.settings.limits.maxRecordsTotal.consumed).toBeUndefined();
  });

  test('retrieve stream with statistics', async () => {
    const retrieved = await client.streams.retrieve({
      externalId: mutableStreamId,
      includeStatistics: true,
    });
    expect(retrieved.externalId).toBe(mutableStreamId);
    expect(retrieved.createdTime).toBeInstanceOf(Date);
    expect(retrieved.type).toBe('Mutable');
    expect(retrieved.settings.limits.maxRecordsTotal.provisioned).toBeDefined();
    // consumed should be present with includeStatistics
    expect(retrieved.settings.limits.maxRecordsTotal.consumed).toBeDefined();
  });

  test('delete non-existent stream (idempotent)', async () => {
    // Delete is idempotent - should not throw even if stream doesn't exist
    await expect(
      client.streams.delete('non_existent_stream_id')
    ).resolves.toBeUndefined();
  });
});
