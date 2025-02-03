// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('raw unit tests', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list rows with query params', async () => {
    nock(mockBaseUrl)
      .get(/\/raw\/dbs\/1\/tables\/2\/rows/)
      .query({ limit: 1 })
      .reply(200, {});
    const result = await client.raw.listRows('1', '2', { limit: 1 });
    expect(result).toEqual({});
  });

  test('list rows with no undefined params', async () => {
    nock(mockBaseUrl)
      .get(/\/raw\/dbs\/1\/tables\/2\/rows/)
      .reply(200, {});
    const result = await client.raw.listRows('1', '2', { limit: undefined });
    expect(result).toEqual({});
  });
});
