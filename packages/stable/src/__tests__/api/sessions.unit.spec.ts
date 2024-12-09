import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Sessions unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('create', async () => {
    const createItem = { tokenExchange: true as const };
    const response = {
      items: [{ id: 1, status: 'ACTIVE', nonce: 'abc' }],
    };

    nock(mockBaseUrl)
      .post(/\/sessions/)
      .reply(200, response);

    const result = await client.sessions.create([createItem]);
    expect(result).toEqual(response.items);
  });

  test('list', async () => {
    const filter = { status: 'ACTIVE' as const };
    const response = { items: [{ id: 1, status: 'ACTIVE' }] };

    nock(mockBaseUrl)
      .get(/\/sessions/)
      .query(filter)
      .reply(200, response);

    const items = await client.sessions.list({ filter }).autoPagingToArray();
    expect(items).toEqual(response.items);
  });

  test('retrieve', async () => {
    const ids = [{ id: 1 }];
    const response = { items: [{ id: 1, status: 'ACTIVE' }] };

    nock(mockBaseUrl)
      .post(/\/sessions\/byids/)
      .reply(200, response);

    const result = await client.sessions.retrieve(ids);
    expect(result).toEqual(response.items);
  });

  test('revoke', async () => {
    const ids = [{ id: 1 }];
    const response = { items: [{ id: 1, status: 'REVOKED' }] };

    nock(mockBaseUrl)
      .post(/\/sessions\/revoke/)
      .reply(200, response);

    const result = await client.sessions.revoke(ids);
    expect(result).toEqual(response.items);
  });
});
