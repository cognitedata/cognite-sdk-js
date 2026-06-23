// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Data product versions unit test', () => {
  let client: CogniteClientAlpha;

  const dataProductExternalId = 'dp-1';
  const versionCreateBody = {
    version: '1.0.0',
    views: [{ space: 'dp_1_space', externalId: 'my-view', version: '1' }],
    status: 'draft' as const,
    description: 'Test version',
    terms: { usage: 'Internal use only' },
  };

  const mockVersion = {
    ...versionCreateBody,
    createdTime: Date.now(),
    lastUpdatedTime: Date.now() + 1000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(
        /\/dataproducts\/dp-1\/versions$/,
        matches({ items: [versionCreateBody] })
      )
      .once()
      .reply(201, {
        items: [mockVersion],
      });

    const items = await client.dataProductVersions.create(dataProductExternalId, [
      versionCreateBody,
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].version).toEqual('1.0.0');
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/dataproducts\/dp-1\/versions\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockVersion],
        nextCursor: 'next',
      });

    const response = await client.dataProductVersions.list(dataProductExternalId, {
      limit: 10,
      cursor: 'abc',
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].version).toBe('1.0.0');
    expect(response.nextCursor).toBe('next');
  });

  test('retrieve by version', async () => {
    nock(mockBaseUrl)
      .get(/\/dataproducts\/dp-1\/versions\/1\.0\.0$/)
      .once()
      .reply(200, mockVersion);

    const response = await client.dataProductVersions.retrieve(
      dataProductExternalId,
      '1.0.0'
    );
    expect(response.version).toEqual('1.0.0');
  });

  test('update', async () => {
    const updateBody = {
      version: '1.0.0',
      update: {
        description: { set: 'updated description' },
        status: { set: 'published' as const },
      },
    };

    nock(mockBaseUrl)
      .post(
        /\/dataproducts\/dp-1\/versions\/update$/,
        matches({ items: [updateBody] })
      )
      .once()
      .reply(200, {
        items: [
          {
            ...mockVersion,
            description: 'updated description',
            status: 'published',
          },
        ],
      });

    const items = await client.dataProductVersions.update(
      dataProductExternalId,
      [updateBody]
    );
    expect(items).toHaveLength(1);
    expect(items[0].description).toEqual('updated description');
    expect(items[0].status).toEqual('published');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/dataproducts\/dp-1\/versions\/delete$/, {
        items: [{ version: '1.0.0' }],
      })
      .once()
      .reply(200, {});

    await client.dataProductVersions.delete(dataProductExternalId, [
      { version: '1.0.0' },
    ]);
  });
});
