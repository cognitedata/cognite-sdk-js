// Copyright 2024 Cognite AS

import { ViewReference } from 'stable/src/api/instances/types.gen';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Instances integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();
  const describable = {
    externalId: `describable_${timestamp}`,
    space: 'cdf_core',
    title: `title ${timestamp}`,
    description: `description ${timestamp}`,
    labels: [`label1`, 'label2'],
  };
  const view: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  const testSpace = {
    space: `test_data_space`,
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.post(`/api/v1/projects/${client.project}/models/spaces`, {
      data: {
        items: [testSpace],
      },
    });

    await client.post(`/api/v1/projects/${client.project}/models/instances`, {
      data: {
        items: [
          {
            instanceType: 'node',
            externalId: describable.externalId,
            space: testSpace.space,
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
