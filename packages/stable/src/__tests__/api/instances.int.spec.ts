// Copyright 2022 Cognite AS

import { ViewReference } from 'stable/src/api/instances/types.gen';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Instances integration test', () => {
  let client: CogniteClient;
  const describable: ViewReference = {
    externalId: 'Describable',
    space: 'cdf_core',
    type: 'view',
    version: 'v1',
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('search nodes with limit 2', async () => {
    const response = await client.instances.search({
      view: describable,
      instanceType: 'node',
      limit: 2,
    });
    expect(response.items).toHaveLength(2);
    expect(response.items[0].externalId).toBeDefined();
    expect(response.items[1].externalId).toBeDefined();
  });

  test('search with query', async () => {
    const response = await client.instances.search({
      view: describable,
      query: 'a',
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBeDefined();
  });

  test('search with filter', async () => {
    const response = await client.instances.search({
      view: describable,
      filter: {
        prefix: {
          property: ['title'],
          value: 'a',
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].properties);
    const title =
      response.items[0].properties![describable.space][
        `${describable.externalId}/${describable.version}`
      ]['title'].toString();
    expect(title.includes('a'));
  });
});
