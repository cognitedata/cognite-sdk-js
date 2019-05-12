// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { ServiceAccount } from '../../types/types';
import { setupClient } from '../testUtils';

describe('Service accounts integration test', async () => {
  let client: API;
  beforeAll(async () => {
    jest.setTimeout(20000);
    client = await setupClient();
  });

  let serviceAccounts: ServiceAccount[];

  test('create', async () => {
    const serviceAccountsToCreate = [
      { name: 'Service Account 1 ' + new Date().getTime() },
      { name: 'Service Account 2 ' + new Date().getTime() },
    ];
    serviceAccounts = await client.serviceAccounts.create(
      serviceAccountsToCreate
    );
    expect(serviceAccounts.length).toBe(serviceAccountsToCreate.length);
    expect(serviceAccounts[0].id).toBeDefined();
    expect(serviceAccounts[0].name).toBeDefined();
  });

  test('list', async () => {
    const response = await client.serviceAccounts.list();
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].name).toBeDefined();
  });

  test('delete', async () => {
    await client.serviceAccounts.delete(
      serviceAccounts.map(account => account.id)
    );
  });
});
