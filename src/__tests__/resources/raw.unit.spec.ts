// Copyright 2019 Cognite AS

import * as nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('raw unit tests', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list rows with query params', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/raw/dbs/1/tables/2/rows'))
      .query({ limit: 1 })
      .reply(200, {});
    const result = await client.raw.listRows('1', '2', { limit: 1 });
    expect(result).toEqual({});
  });

  test('list rows with no undefined params', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/raw/dbs/1/tables/2/rows'))
      .reply(200, {});
    const result = await client.raw.listRows('1', '2', { limit: undefined });
    expect(result).toEqual({});
  });
});
