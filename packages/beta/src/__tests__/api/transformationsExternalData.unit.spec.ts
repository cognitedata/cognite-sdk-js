// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Transformations external data unit test', () => {
  let client: CogniteClient;

  const createBody = {
    externalId: 'my-fabric-source',
    name: 'Fabric - production lakehouse',
    format: 'one_lake' as const,
    dataSetId: 1,
    settings: {
      credentials: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
        clientSecret: 'client-secret',
      },
      locationDescription: {
        workspaceId: 'workspace-id',
        containerId: 'container-id',
      },
    },
  };

  const mockSource = {
    externalId: 'my-fabric-source',
    name: 'Fabric - production lakehouse',
    format: 'one_lake' as const,
    dataSetId: 1,
    settings: {
      credentials: {
        clientId: 'client-id',
        tenantId: 'tenant-id',
      },
      locationDescription: {
        workspaceId: 'workspace-id',
        containerId: 'container-id',
      },
    },
    createdTime: 1730204346000,
    lastUpdatedTime: 1730204346000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(
        /\/transformations\/externaldata\/?$/,
        matches({ items: [createBody] })
      )
      .once()
      .reply(200, {
        items: [mockSource],
      });

    const items = await client.transformationsExternalData.create([createBody]);

    expect(items).toHaveLength(1);
    expect(items[0].externalId).toEqual('my-fabric-source');
    expect(items[0].format).toEqual('one_lake');
    expect(items[0].settings.credentials).not.toHaveProperty('clientSecret');
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/externaldata\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockSource],
        nextCursor: 'next',
      });

    const response = await client.transformationsExternalData.list({
      limit: 10,
      cursor: 'abc',
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('my-fabric-source');
    expect(response.items[0].dataSetId).toBe(1);
    expect(response.nextCursor).toBe('next');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/externaldata\/delete$/, {
        items: [{ externalId: 'my-fabric-source' }],
      })
      .once()
      .reply(200, {});

    await client.transformationsExternalData.delete([
      { externalId: 'my-fabric-source' },
    ]);
  });

  test('usability', async () => {
    nock(mockBaseUrl)
      .post(
        /\/transformations\/externaldata\/usability$/,
        matches({ externalId: 'my-fabric-source' })
      )
      .once()
      .reply(200, {
        externalId: { externalId: 'my-fabric-source' },
        usableVersion: '9f2b1c34-5d6e-4f70-8a91-b2c3d4e5f607',
      });

    const status = await client.transformationsExternalData.usability({
      externalId: 'my-fabric-source',
    });

    expect(status.externalId.externalId).toBe('my-fabric-source');
    expect(status.usableVersion).toBe('9f2b1c34-5d6e-4f70-8a91-b2c3d4e5f607');
  });
});
