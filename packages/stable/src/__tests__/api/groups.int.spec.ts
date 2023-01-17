// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Group, GroupSpec } from '../../types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

const testDataSetId = 7268396229058705;

describe('Groups integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  let group: Group;
  const groupsToDelete: Group[] = [];
  const groupName = 'Group name';

  test('create', async () => {
    const groupsToCreate: GroupSpec[] = [
      {
        name: groupName + randomInt(),
        capabilities: [
          {
            eventsAcl: { actions: ['READ'], scope: { all: {} } },
          },
        ],
      },
    ];
    const response = await client.groups.create(groupsToCreate);
    expect(response.length).toBe(1);
    [group] = response;
    groupsToDelete.push(group);
    expect(group.name).toBe(groupsToCreate[0].name);
  });

  test('list', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const response = await client.groups.list({ all: true });
      expect(response.length).toBeGreaterThan(0);
      expect(response.map((item) => item.name)).toContain(group.name);
    });
  });

  test('create asset group with datasetScope', async () => {
    const groupsToCreate: GroupSpec[] = [
      {
        name: groupName + randomInt(),
        capabilities: [
          {
            assetsAcl: {
              actions: ['READ'],
              scope: { datasetScope: { ids: [testDataSetId] } },
            },
          },
        ],
      },
    ];
    const response = await client.groups.create(groupsToCreate);
    expect(response.length).toBe(1);
    [group] = response;
    groupsToDelete.push(group);
    expect(group.name).toBe(groupsToCreate[0].name);
  });

  test('create dataset group', async () => {
    const groupsToCreate: GroupSpec[] = [
      {
        name: groupName + randomInt(),
        capabilities: [
          {
            datasetsAcl: { actions: ['READ'], scope: { all: {} } },
          },
        ],
      },
    ];
    const response = await client.groups.create(groupsToCreate);
    expect(response.length).toBe(1);
    [group] = response;
    groupsToDelete.push(group);
    expect(group.name).toBe(groupsToCreate[0].name);
  });

  test('delete', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const response = await client.groups.delete(
        groupsToDelete.map((g) => g.id)
      );
      expect(response).toEqual({});
    });
  });
});
