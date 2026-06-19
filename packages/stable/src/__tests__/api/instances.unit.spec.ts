// Copyright 2024 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { QueryRequest } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const QUERY_PARAMS = {
  with: { myNodes: { nodes: {} } },
  select: {
    myNodes: {
      sources: [
        {
          source: {
            type: 'view' as const,
            space: 's',
            externalId: 'V',
            version: 'v1',
          },
          properties: ['name'],
        },
      ],
    },
  },
};

const QUERY_RESPONSE = {
  items: {
    myNodes: [
      {
        instanceType: 'node',
        space: 's',
        externalId: 'n1',
        version: 1,
        lastUpdatedTime: 0,
        createdTime: 0,
        properties: { s: { 'V/v1': { name: 'hello' } } },
      },
    ],
  },
};

describe('InstancesAPI.query backward-compatibility unit tests', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('old-style call (no type param, plain QueryRequest) returns QueryResponse data', async () => {
    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/)
      .once()
      .reply(200, QUERY_RESPONSE);

    // This is the pre-existing API usage: no type parameters, plain QueryRequest.
    // TypeScript should infer Promise<QueryResponse> (same as before the change).
    const result = await client.instances.query(QUERY_PARAMS);

    expect(result).toEqual(QUERY_RESPONSE);
    expect(result.items.myNodes).toHaveLength(1);
  });

  test('typed call with const query hits the same endpoint and returns data', async () => {
    const typedQuery = {
      with: { myEdges: { edges: {} } },
      select: {
        myEdges: {
          sources: [
            {
              source: {
                type: 'view' as const,
                space: 'sp',
                externalId: 'E',
                version: 'v1',
              },
              properties: ['label'],
            },
          ],
        },
      },
    } as const satisfies QueryRequest;

    const mockResponse = {
      items: {
        myEdges: [
          {
            instanceType: 'edge',
            space: 'sp',
            externalId: 'e1',
            version: 1,
            lastUpdatedTime: 0,
            createdTime: 0,
            properties: { sp: { 'E/v1': { label: 'an-edge' } } },
          },
        ],
      },
    };

    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/)
      .once()
      .reply(200, mockResponse);

    // With a const-narrowed query the return type is inferred, but the runtime
    // behaviour is identical: same POST endpoint, same data is returned.
    const result = await client.instances.query(typedQuery);

    expect(result).toEqual(mockResponse);
    expect(result.items.myEdges).toHaveLength(1);
  });
});
