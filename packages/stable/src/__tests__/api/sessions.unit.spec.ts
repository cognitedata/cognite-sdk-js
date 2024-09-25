import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import nock from 'nock';
import { SessionsApi } from '../../api/sessions/sessionsApi';
import { CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  CreateSessionRequestList,
  CreateSessionResponseList,
  SessionList,
  SessionReferenceIds,
} from '../../api/sessions/types.gen';
import { mockBaseUrl, setupMockableClient } from '../testUtils';


describe('SessionsApi', () => {
    let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('create', async () => {
    const request: CreateSessionRequestList = { items: [{ tokenExchange: true }] };
    const response: CreateSessionResponseList = { items: [{ id: 1, status: 'ACTIVE', nonce: 'abc' }] };

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