import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type {
  CreateSessionRequestList,
  CreateSessionResponseList,
  SessionList,
  SessionReferenceIds,
} from '../../api/sessions/types.gen';
import { mockBaseUrl, setupMockableClient } from '../testUtils';
import type CogniteClient from '../../cogniteClient';

describe('SessionsApi', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('create', async () => {
    const request: CreateSessionRequestList = {
      items: [{ tokenExchange: true }],
    };
    const response: CreateSessionResponseList = {
      items: [{ id: 1, status: 'ACTIVE', nonce: 'abc' }],
    };

    nock(mockBaseUrl)
      .post(/\/sessions/)
      .reply(200, response);

    const result = await client.sessions.create(request);
    expect(result.data).toEqual(response);
  });

  test('list', async () => {
    const params = { status: 'active', cursor: 'abc', limit: 10 };
    const response: SessionList = { items: [{ id: 1, status: 'ACTIVE' }] };

    nock(mockBaseUrl)
      .get(/\/sessions/)
      .query(params)
      .reply(200, response);

    const result = await client.sessions.list(params);
    expect(result.data).toEqual(response);
  });

  test('retrieve', async () => {
    const scope: SessionReferenceIds = { items: [{ id: 1 }] };
    const response: SessionList = { items: [{ id: 1, status: 'ACTIVE' }] };

    nock(mockBaseUrl)
      .post(/\/sessions\/byids/)
      .reply(200, response);

    const result = await client.sessions.retrieve(scope);
    expect(result.data).toEqual(response);
  });

  test('revoke', async () => {
    const scope: SessionReferenceIds = { items: [{ id: 1 }] };
    const response: SessionList = { items: [{ id: 1, status: 'REVOKED' }] };

    nock(mockBaseUrl)
      .post(/\/sessions\/revoke/)
      .reply(200, response);

    const result = await client.sessions.revoke(scope);
    expect(result.data).toEqual(response);
  });
});
