// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { GroupServiceAccount, NewApiKeyResponseDTO } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('API keys integration test', () => {
  let client: CogniteClient;
  let serviceAccount: GroupServiceAccount;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [serviceAccount] = await client.serviceAccounts.create([
      { name: 'Test' + randomInt() },
    ]);
  });

  afterAll(async () => {
    await client.serviceAccounts.delete([serviceAccount.id]);
  });

  let apiKeys: NewApiKeyResponseDTO[];

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
