// Copyright 2024 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
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
        instanceType: 'node' as const,
        space: 's',
        externalId: 'n1',
        version: 1,
        lastUpdatedTime: 0,
        createdTime: 0,
        properties: { s: { 'V/v1': { name: 'hello' } } },
      },
    ],
  },
  nextCursor: undefined,
};

describe('InstancesAPI unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('queryTyped posts to the instances/query endpoint and returns response data', async () => {
    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/, QUERY_PARAMS)
      .once()
      .reply(200, QUERY_RESPONSE);

    const result = await client.instances.queryTyped(QUERY_PARAMS);

    expect(result).toEqual(QUERY_RESPONSE);
  });

  test('queryTyped passes through arbitrary query params unchanged', async () => {
    const customQuery = {
      with: { edges: { edges: {} } },
      select: { edges: {} },
    };

    nock(mockBaseUrl)
      .post(/\/models\/instances\/query/, customQuery)
      .once()
      .reply(200, { items: { edges: [] } });

    const result = await client.instances.queryTyped(customQuery);

    expect(result).toEqual({ items: { edges: [] } });
  });
});
