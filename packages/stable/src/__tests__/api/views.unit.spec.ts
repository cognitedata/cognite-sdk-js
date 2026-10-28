// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

/**
 * Intercepts the next `GET /models/views` request and captures the request URI
 * (path + query string) so the query-parameter serialization can be asserted.
 */
const interceptViewsList = (captured: { uri?: string }) =>
  nock(mockBaseUrl)
    .get((uri) => {
      if (!uri.includes('/models/views')) {
        return false;
      }
      captured.uri = uri;
      return true;
    })
    .reply(200, { items: [] });

describe('Views unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('list serializes usedFor as repeated query parameters', async () => {
    const captured: { uri?: string } = {};
    interceptViewsList(captured);

    await client.views.list({ usedFor: ['node', 'record'] });

    expect(captured.uri).toBeDefined();
    expect(captured.uri).toContain('usedFor=node&usedFor=record');
    // Guards against the `?usedFor=["node","record"]` JSON-array form produced
    // by the default list caller, which this endpoint rejects.
    expect(captured.uri).not.toContain('usedFor=%5B');
  });

  test('list keeps scalar query parameters alongside usedFor', async () => {
    const captured: { uri?: string } = {};
    interceptViewsList(captured);

    await client.views.list({
      usedFor: ['record'],
      space: 'my_space',
      includeGlobal: false,
      limit: 10,
    });

    expect(captured.uri).toBeDefined();
    expect(captured.uri).toContain('usedFor=record');
    expect(captured.uri).toContain('space=my_space');
    expect(captured.uri).toContain('includeGlobal=false');
    expect(captured.uri).toContain('limit=10');
  });

  test('list without usedFor omits the parameter', async () => {
    const captured: { uri?: string } = {};
    interceptViewsList(captured);

    await client.views.list();

    expect(captured.uri).toBeDefined();
    expect(captured.uri).not.toContain('usedFor');
    expect(captured.uri).toContain('includeGlobal=false');
  });

  test('list paginates while preserving usedFor', async () => {
    const uris: string[] = [];
    let requests = 0;
    const page = (externalId: string, nextCursor?: string) => ({
      items: [
        {
          externalId,
          space: 'my_space',
          version: '1',
          usedFor: 'record',
          streamId: ['my_stream'],
          createdTime: 0,
          lastUpdatedTime: 0,
          writable: true,
          queryable: true,
          isGlobal: false,
          properties: {},
          mappedContainers: [],
        },
      ],
      nextCursor,
    });

    nock(mockBaseUrl)
      .get(/\/models\/views/)
      .twice()
      // Not an arrow function: `this.req` is how nock exposes the request.
      .reply(200, function () {
        uris.push(this.req.path);
        requests += 1;
        return requests === 1 ? page('first', 'cursor-2') : page('second');
      });

    const all = await client.views
      .list({ usedFor: ['record'], limit: 1 })
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });

    expect(all.map((view) => view.externalId)).toEqual(['first', 'second']);
    expect(all[0].usedFor).toBe('record');
    expect(all[0].streamId).toEqual(['my_stream']);
    // The follow-up request must carry both the cursor and the original filter.
    expect(uris[1]).toContain('cursor=cursor-2');
    expect(uris[1]).toContain('usedFor=record');
  });
});
