// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import {
  AclActionevents,
  Group,
  GroupSpec,
  ServiceAccount,
} from '../../types/types';
import { sleepPromise } from '../../utils';
import { randomInt, retryInSeconds, setupClient } from '../testUtils';

describe('Groups integration test', () => {
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

  let group: Group;

  test('create', async () => {
    const groupsToCreate: GroupSpec[] = [
      {
        name: 'Group name' + randomInt(),
        capabilities: [
          {
            eventsAcl: { actions: [AclActionevents.READ], scope: { all: {} } },
          },
        ],
      },
    ];
    const response = await client.groups.create(groupsToCreate);
    expect(response.length).toBe(1);
    [group] = response;
    expect(group.name).toBe(groupsToCreate[0].name);
    await sleepPromise(15 * 1000);
  });

  test('add service account', async done => {
    const response = await retryInSeconds(
      () => client.groups.addServiceAccounts(group.id, [serviceAccount.id]),
      5,
      400,
      60
    );
    expect(response).toEqual({});
    done();
  });

  test('list', async () => {
    const response = await client.groups.list({ all: true });
    expect(response.length).toBeGreaterThan(0);
    expect(response.map(item => item.name)).toContain(group.name);
  });

  test('list service account', async () => {
    const response = await client.groups.listServiceAccounts(group.id);
    expect(response.map(item => item.id)).toContain(serviceAccount.id);
  });

  test('remove service account', async () => {
    const response = await client.groups.removeServiceAccounts(group.id, [
      serviceAccount.id,
    ]);
    expect(response).toEqual({});
  });

  test('delete', async () => {
    const response = await client.groups.delete([group.id]);
    expect(response).toEqual({});
  });
});
