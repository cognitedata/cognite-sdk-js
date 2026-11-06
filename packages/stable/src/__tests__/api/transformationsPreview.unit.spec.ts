// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { TransformationPreviewResult } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformations preview unit test', () => {
  let client: CogniteClient;

  const query = 'select * from `db`.`table`';

  const result: TransformationPreviewResult = {
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

  test('preview sends all request fields', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/query\/run$/, {
        query,
        convertToString: true,
        limit: 100,
        sourceLimit: 1000,
        inferSchemaLimit: 500,
        timeout: 60,
      })
      .once()
      .reply(200, result);

    const response = await client.transformations.preview({
      query,
      convertToString: true,
      limit: 100,
      sourceLimit: 1000,
      inferSchemaLimit: 500,
      timeout: 60,
    });
    expect(response).toEqual(result);
  });

  test('preview sends convertToString false by default', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/query\/run$/, {
        query,
        convertToString: false,
      })
      .once()
      .reply(200, result);

    const response = await client.transformations.preview({ query });
    expect(response).toEqual(result);
  });

  test('preview sends convertToString false when it is undefined', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/query\/run$/, {
        query,
        convertToString: false,
      })
      .once()
      .reply(200, result);

    const response = await client.transformations.preview({
      query,
      convertToString: undefined,
    });
    expect(response).toEqual(result);
  });
});
