// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { NewApiKeyResponse, ServiceAccount } from '../../types/types';
import { randomInt, setupClient } from '../testUtils';

describe('API keys integration test', () => {
  let client: API;
  let serviceAccount: ServiceAccount;
  beforeAll(async () => {
    client = setupClient();
    [serviceAccount] = await client.serviceAccounts.create([
      { name: 'Test' + randomInt() },
    ]);
  });

  afterAll(async () => {
    await client.serviceAccounts.delete([serviceAccount.id]);
  });

  let apiKeys: NewApiKeyResponse[];

  test('create', async () => {
    apiKeys = await client.apiKeys.create([
      {
        serviceAccountId: serviceAccount.id,
      },
    ]);
    expect(apiKeys).toBeDefined();
    expect(apiKeys.length).toBe(1);
    expect(apiKeys[0].id).toBeDefined();
    expect(apiKeys[0].value).toBeDefined();
  });

  test('list', async () => {
    const response = await client.apiKeys.list({
      serviceAccountId: serviceAccount.id,
    });
    expect(response).toBeDefined();
    expect(response.length).toBe(1);
    expect(response[0].id).toBe(apiKeys[0].id);
  });

  test('delete', async () => {
    const response = await client.apiKeys.delete(apiKeys.map(key => key.id));
    expect(response).toEqual({});
  });
});
