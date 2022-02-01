// Copyright 2020 Cognite AS

import CogniteClient from '../../../cogniteClient';
import { ServiceAccount } from '../../../types';
import { randomInt, setupLoggedInClientWithOidc } from '../../testUtils';

describe('Service accounts integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClientWithOidc();
    await client.authenticate();
  });

  let serviceAccounts: ServiceAccount[];

  test('create', async () => {
    const serviceAccountsToCreate = [
      { name: 'Service Account 1 ' + randomInt() },
      { name: 'Service Account 2 ' + randomInt() },
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
    const response = await client.serviceAccounts.delete(
      serviceAccounts.map((account) => account.id)
    );
    expect(response).toEqual({});
  });
});
