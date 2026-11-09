// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  TransformationQueryRunRequest,
  TransformationQueryRunResult,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformation query unit test', () => {
  let client: CogniteClient;

  const query = 'select * from `db`.`table`';

  const result: TransformationQueryRunResult = {
    schema: {
      items: [
        { name: 'key', sqlType: 'string', type: 'string', nullable: false },
        {
          name: 'tags',
          sqlType: 'array<string>',
          type: { type: 'array', elementType: 'string', containsNull: true },
          nullable: true,
        },
      ],
    },
    results: { items: [{ key: 'a', tags: ['x', 'y'] }] },
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('run sends all request fields', async () => {
    const request: TransformationQueryRunRequest = {
      query,
      convertToString: true,
      limit: 100,
      sourceLimit: 1000,
      inferSchemaLimit: 500,
      timeout: 60,
    };
    nock(mockBaseUrl)
      .post(/\/transformations\/query\/run$/, { ...request })
      .once()
      .reply(200, result);

    const response = await client.transformations.query.run(request);
    expect(response).toEqual(result);
  });

  test('run sends only the required fields', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/query\/run$/, { query, convertToString: false })
      .once()
      .reply(200, result);

    const response = await client.transformations.query.run({
      query,
      convertToString: false,
    });
    expect(response).toEqual(result);
  });

  test('convertToString is required', () => {
    // @ts-expect-error convertToString is required
    const request: TransformationQueryRunRequest = { query };
    expect(request).toEqual({ query });
  });
});
