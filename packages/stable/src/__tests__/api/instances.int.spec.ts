// Copyright 2024 Cognite AS

import { ViewReference } from 'stable/src/types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

type SpaceDefinition = {
  space: string;
  name: string;
  description: string;
};

type Describable = {
  externalId: string;
  space: string;
  title: string;
  description: string;
  labels: string[];
};

const upsertSpace = async (client: CogniteClient, space: SpaceDefinition) => {
  await client.post(`/api/v1/projects/${client.project}/models/spaces`, {
    data: {
      items: [space],
    },
  });
};

const upsertDescribables = async (
  client: CogniteClient,
  describables: Describable[],
  view: ViewReference
) => {
  await client.post(`/api/v1/projects/${client.project}/models/instances`, {
    data: {
      items: [
        describables.map((describable) => ({
          instanceType: 'node',
          externalId: describable.externalId,
          space: describable.space,
          sources: [{ source: view }],
          properties: {
            title: describable.title,
            description: describable.description,
            labels: describable.labels,
          },
        })),
      ],
    },
  });
};

describe('Instances integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();

  const testSpace: SpaceDefinition = {
    space: `test_data_space`,
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };
  const view: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  const describable1: Describable = {
    externalId: `describable_1_${timestamp}`,
    space: testSpace.space,
    title: `title_1_${timestamp}`,
    description: `description_1_${timestamp}`,
    labels: [`label1`, 'label2'],
  };
  const describable2: Describable = {
    externalId: `describable_2_${timestamp}`,
    space: testSpace.space,
    title: `title_2_${timestamp}`,
    description: `description_2_${timestamp}`,
    labels: [`label1`, 'label2'],
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await upsertSpace(client, testSpace);
    await upsertDescribables(client, [describable1, describable2], view);
  });

  afterAll(async () => {
    await client.post(
      `/api/v1/projects/${client.project}/models/instances/delete`,
      {
        data: {
          items: [
            {
              instanceType: 'node',
              externalId: describable1.externalId,
              space: testSpace.space,
            },
          ],
        },
      }
    );
  });

  test('list nodes from a single view with limit 1', async () => {
    const response = await client.instances.list({
      sources: [{ source: view }],
      instanceType: 'node',
      limit: 1,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('list nodes with a filter that returns 1 result', async () => {
    const response = await client.instances.list({
      sources: [{ source: view }],
      filter: {
        equals: {
          property: ['title'],
          value: describable1.title,
        },
      },
      instanceType: 'node',
      limit: 1000,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[0].externalId).toBe(describable1.externalId);
  });

  test('list nodes with a filter that returns no results', async () => {
    const response = await client.instances.list({
      sources: [{ source: view }],
      filter: {
        equals: {
          property: ['title'],
          value: 'No describable has this title',
        },
      },
      instanceType: 'node',
      limit: 1000,
    });
    expect(response.items).toHaveLength(0);
  });

  test('list nodes sorted in ascending order', async () => {
    const response = await client.instances.list({
      sources: [{ source: view }],
      sort: [
        { property: ['title'], direction: 'ascending', nullsFirst: false },
      ],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();

    const title1 =
      response.items[0].properties![view.space][
        `${view.externalId}/${view.version}`
      ]['title'].toString();
    const title2 =
      response.items[0].properties![view.space][
        `${view.externalId}/${view.version}`
      ]['title'].toString();
    expect(title1 < title2);
  });

  test('list nodes sorted in descending order', async () => {
    const response = await client.instances.list({
      sources: [{ source: view }],
      sort: [
        { property: ['title'], direction: 'descending', nullsFirst: false },
      ],
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();

    const title1 =
      response.items[0].properties![view.space][
        `${view.externalId}/${view.version}`
      ]['title'].toString();
    const title2 =
      response.items[0].properties![view.space][
        `${view.externalId}/${view.version}`
      ]['title'].toString();
    expect(title1 > title2);
  });

  test('search nodes with limit 2', async () => {
    const response = await client.instances.search({
      view,
      instanceType: 'node',
      limit: 1,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('search with query', async () => {
    const response = await client.instances.search({
      view,
      query: describable1.description,
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe(describable1.externalId);
  });

  test('search with filter', async () => {
    const response = await client.instances.search({
      view,
      filter: {
        prefix: {
          property: ['title'],
          value: 'titl',
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].properties);
    const title =
      response.items[0].properties![view.space][
        `${view.externalId}/${view.version}`
      ]['title'].toString();
    expect(title.startsWith('titl'));
  });
});
