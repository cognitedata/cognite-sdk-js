// Copyright 2024 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { GroupSpec } from '../../types';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';

describe('Groups unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test.each<{ name: string; group: GroupSpec }>([
    {
      name: 'an all-scoped events group',
      group: {
        name: 'events-group',
        capabilities: [
          { eventsAcl: { actions: ['READ'], scope: { all: {} } } },
        ],
      },
    },
    {
      name: 'an asset group with datasetScope',
      group: {
        name: 'asset-group',
        capabilities: [
          {
            assetsAcl: {
              actions: ['READ'],
              scope: { datasetScope: { ids: [123] } },
            },
          },
        ],
      },
    },
    {
      name: 'a dataset group',
      group: {
        name: 'dataset-group',
        capabilities: [
          { datasetsAcl: { actions: ['READ'], scope: { all: {} } } },
        ],
      },
    },
  ])('can create $name', async ({ group }) => {
    const created = { ...group, id: 42, isDeleted: false };
    let requestBody: unknown;
    nock(mockBaseUrl)
      .post(/\/groups$/, (body) => {
        requestBody = body;
        return true;
      })
      .once()
      .reply(200, { items: [created] });

    const response = await client.groups.create([group]);

    expect({ requestBody, response }).toEqual({
      requestBody: { items: [group] },
      response: [created],
    });
  });

  test('list with all: true', async () => {
    nock(mockBaseUrl)
      .get(/\/groups\/$/)
      .query({ all: true })
      .once()
      .reply(200, {
        items: [
          { id: 1, name: 'active', isDeleted: false },
          {
            id: 2,
            name: 'deleted',
            isDeleted: true,
            deletedTime: 1700000000000,
          },
        ],
      });

    const groups = await client.groups.list({ all: true });

    expect(groups).toEqual([
      { id: 1, name: 'active', isDeleted: false },
      {
        id: 2,
        name: 'deleted',
        isDeleted: true,
        deletedTime: new Date(1700000000000),
      },
    ]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/groups\/delete$/, { items: [111, 222] })
      .once()
      .reply(200, {});

    const response = await client.groups.delete([111, 222]);

    expect(response).toEqual({});
  });

  test('can create a CDF managed allUserAccounts group', async () => {
    nock(mockBaseUrl)
      .post(/\/groups/, {
        items: [{ name: 'test-group', members: 'allUserAccounts' }],
      })
      .once()
      .reply(200, {
        items: [{ name: 'test-group', members: 'allUserAccounts' }],
      });
    await client.groups.create([
      {
        name: 'test-group',
        members: 'allUserAccounts',
      },
    ]);
  });

  test('can create a CDF managed group', async () => {
    nock(mockBaseUrl)
      .post(/\/groups/, {
        items: [
          {
            name: 'test-group',
            members: ['a', 'b'],
          },
        ],
      })
      .once()
      .reply(200, {
        items: [
          {
            name: 'test-group',
            members: ['a', 'b'],
          },
        ],
      });
    await client.groups.create([
      {
        name: 'test-group',
        members: ['a', 'b'],
      },
    ]);
  });
});
