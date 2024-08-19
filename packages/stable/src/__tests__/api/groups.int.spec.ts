// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

let testDataSetId = -1;

describe('Groups integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
    // upsert dataset
    const datasetExternalId = 'groups-integration-test-data-set';
    const datasets = await client.datasets.retrieve(
      [{ externalId: datasetExternalId }],
      { ignoreUnknownIds: true }
    );
    if (datasets.length === 0) {
      const [dataset] = await client.datasets.create([
        {
          externalId: datasetExternalId,
          name: 'Groups integration test data set',
        },
      ]);
      testDataSetId = dataset.id;
    } else {
      testDataSetId = datasets[0].id;
    }
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
