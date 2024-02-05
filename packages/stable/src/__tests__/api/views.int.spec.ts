// Copyright 2024 Cognite AS

import { ViewCreateDefinition } from 'stable/src/types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Views integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();

  const TEST_SPACE_NAME = `Views_integration_test_${timestamp}`;
  const TEST_CONTAINER_NAME = `Views_integration_test_container${timestamp}`;

  const viewCreationDefinition: ViewCreateDefinition = {
    externalId: 'test_view',
    space: TEST_SPACE_NAME,
    name: 'test_data_space',
    description: 'Instance space used for integration tests.',
    version: '1',
    properties: {
      test: {
        container: {
          type: 'container',
          externalId: TEST_CONTAINER_NAME,
          space: TEST_SPACE_NAME,
        },
        containerPropertyIdentifier: 'test',
      },
    },
  };
  const viewCreationDefinition2: ViewCreateDefinition = {
    externalId: 'test_view_2',
    space: TEST_SPACE_NAME,
    name: 'test_data_space_2',
    description: 'Instance space used for integration tests.',
    version: '1',
    properties: {
      test: {
        container: {
          type: 'container',
          externalId: TEST_CONTAINER_NAME,
          space: TEST_SPACE_NAME,
        },
        containerPropertyIdentifier: 'test',
      },
    },
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.upsert([
      {
        space: TEST_SPACE_NAME,
        name: TEST_SPACE_NAME,
        description: 'Instance space used for views integration tests.',
      },
    ]);
    await client.containers.upsert([
      {
        externalId: TEST_CONTAINER_NAME,
        space: TEST_SPACE_NAME,
        name: TEST_SPACE_NAME,
        description: 'Instance space used for views integration tests.',
        properties: {
          test: {
            type: { type: 'text' },
          },
        },
      },
    ]);
  });
  afterAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.delete([TEST_SPACE_NAME]);
    await client.containers.delete([
      { externalId: TEST_CONTAINER_NAME, space: TEST_SPACE_NAME },
    ]);
  });

  it('should successfully upsert views', async () => {
    const createdViewResponse = await client.views.upsert([
      viewCreationDefinition,
      viewCreationDefinition2,
    ]);

    expect(createdViewResponse.items).toHaveLength(2);
    expect(createdViewResponse.items[0].name).toEqual(
      viewCreationDefinition.name
    );
    expect(createdViewResponse.items[0].externalId).toEqual(
      viewCreationDefinition.externalId
    );
    expect(createdViewResponse.items[1].name).toEqual(
      viewCreationDefinition2.name
    );
    expect(createdViewResponse.items[1].externalId).toEqual(
      viewCreationDefinition2.externalId
    );
  });

  it('should successfully list Views', async () => {
    const views = await client.views.list({ limit: 1000 });
    const view1 = views.items.find(
      (view) => view.externalId === viewCreationDefinition.externalId
    );
    const View2 = views.items.find(
      (view) => view.externalId === viewCreationDefinition2.externalId
    );
    expect(view1).toBeDefined();
    expect(View2).toBeDefined();
  });

  it('should successfully list global Views', async () => {
    const Views = await client.views.list({
      includeGlobal: true,
      limit: 1000,
    });
    const globalView = Views.items.find((view) => view.isGlobal);
    expect(globalView).toBeDefined();
  });

  it('should successfully list Views via cursor', async () => {
    const Views = await client.views
      .list({
        includeGlobal: true,
        limit: 1,
      })
      .autoPagingToArray({ limit: 2 });
    expect(Views.length).toBeGreaterThanOrEqual(2);
  });

  it('should successfully retrieve Views', async () => {
    const views = await client.views.retrieve([
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition.externalId,
      },
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition2.externalId,
      },
    ]);
    expect(views.length).toBe(2);
    expect(views[0].name).toEqual(viewCreationDefinition.name);
    expect(views[1].name).toEqual(viewCreationDefinition2.name);
  });

  it('should successfully delete Views', async () => {
    const response = await client.views.delete([
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition.externalId,
        version: '1',
      },
      {
        space: TEST_SPACE_NAME,
        externalId: viewCreationDefinition2.externalId,
        version: '1',
      },
    ]);
    expect(response.items).toHaveLength(2);

    const views = await client.views.list({ limit: 1000 });
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition.externalId
      )
    ).toBeUndefined();
    expect(
      views.items.find(
        (view) => view.externalId === viewCreationDefinition2.externalId
      )
    ).toBeUndefined();
  });
});
