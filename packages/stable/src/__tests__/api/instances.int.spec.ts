// Copyright 2024 Cognite AS

import { ViewReference } from 'stable/src/api/instances/types.gen';
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

const upsertDescribable = async (
  client: CogniteClient,
  describable: Describable
) => {
  const view: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };
  await client.post(`/api/v1/projects/${client.project}/models/instances`, {
    data: {
      items: [
        {
          instanceType: 'node',
          externalId: describable.externalId,
          space: describable.space,
          sources: [{ source: view }],
          properties: {
            title: describable.title,
            description: describable.description,
            labels: describable.labels,
          },
        },
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

  const describable: Describable = {
    externalId: `describable_${timestamp}`,
    space: testSpace.space,
    title: `title ${timestamp}`,
    description: `description ${timestamp}`,
    labels: [`label1`, 'label2'],
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await upsertSpace(client, testSpace);
    await upsertDescribable(client, describable);
  });

  afterAll(async () => {
    await client.post(
      `/api/v1/projects/${client.project}/models/instances/delete`,
      {
        data: {
          items: [
            {
              instanceType: 'node',
              externalId: describable.externalId,
              space: testSpace.space,
            },
          ],
        },
      }
    );
  });

  test('search nodes with limit 1', async () => {
    const response = await client.instances.search({
      view,
      instanceType: 'node',
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBeDefined();
  });

  test('search with query', async () => {
    const response = await client.instances.search({
      view,
      query: describable.description,
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe(describable.externalId);
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
