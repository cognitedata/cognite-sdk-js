// Copyright 2025 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ByIdsResponse,
  NodeOrEdgeSearchRequest,
  QueryRequest,
  QueryResponse,
  SearchRequestInput,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const view = {
  type: 'view',
  space: 'spaceA',
  externalId: 'ViewA',
  version: 'v1',
} as const;

const response = {
  items: {
    rs: [
      {
        instanceType: 'node',
        space: 'spaceA',
        externalId: 'node1',
        version: 1,
        createdTime: 0,
        lastUpdatedTime: 0,
        properties: { spaceA: { 'ViewA/v1': { title: 'hello' } } },
      },
    ],
  },
  nextCursor: {},
};

describe('Instances unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('query posts the request unchanged and returns the response body', async () => {
    const request: QueryRequest = {
      with: { rs: { nodes: {} } },
      select: { rs: { sources: [{ source: view, properties: ['title'] }] } },
    };
    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/, (body) => {
        expect(body).toEqual(request);
        return true;
      })
      .once()
      .reply(200, response);

    const result: QueryResponse = await client.instances.query(request);

    expect(result).toEqual(response);
  });

  test('a const request hits the same endpoint and the typed result reads the same data', async () => {
    const request = {
      with: { rs: { nodes: {} } },
      select: { rs: { sources: [{ source: view, properties: ['title'] }] } },
    } as const satisfies QueryRequest;
    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/, (body) => {
        expect(body).toEqual(request);
        return true;
      })
      .once()
      .reply(200, response);

    const result = await client.instances.query(request);

    expect(result).toEqual(response);
    expect(result.items.rs[0].properties.spaceA['ViewA/v1'].title).toBe(
      'hello'
    );
    // Dynamic keys keep working at runtime and compile time.
    const alias: string = 'rs';
    expect(result.items[alias]).toHaveLength(1);
  });

  const searchResponse = {
    items: [
      {
        instanceType: 'node',
        space: 'spaceA',
        externalId: 'node1',
        version: 1,
        createdTime: 0,
        lastUpdatedTime: 0,
        properties: { spaceA: { 'ViewA/v1': { title: 'hello' } } },
      },
    ],
  };

  test('search posts the request unchanged and returns the response body', async () => {
    const request: NodeOrEdgeSearchRequest = { view, query: 'hello', limit: 5 };
    nock(mockBaseUrl)
      .post(/\/models\/instances\/search/, (body) => {
        expect(body).toEqual(request);
        return true;
      })
      .once()
      .reply(200, searchResponse);

    const result: ByIdsResponse = await client.instances.search(request);

    expect(result).toEqual(searchResponse);
  });

  test('a const search request hits the same endpoint and the typed result reads the same data', async () => {
    const request = {
      view,
      instanceType: 'node',
      query: 'hello',
      properties: ['title'],
    } as const satisfies SearchRequestInput;
    nock(mockBaseUrl)
      .post(/\/models\/instances\/search/, (body) => {
        expect(body).toEqual(request);
        return true;
      })
      .once()
      .reply(200, searchResponse);

    const result = await client.instances.search(request);

    expect(result).toEqual(searchResponse);
    expect(result.items[0].properties?.spaceA['ViewA/v1'].title).toBe('hello');
  });
});
