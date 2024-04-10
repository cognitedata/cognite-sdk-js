// Copyright 2024 Cognite AS

import { DataModelCreate, ViewCreateDefinition } from 'stable/src/types';
import CogniteClient from '../../cogniteClient';
import { deleteOldSpaces, randomInt, setupLoggedInClient } from '../testUtils';

describe('Data models integration test', () => {
  let client: CogniteClient;

  const TEST_SPACE_NAME = `Datamodels_integration_test_${randomInt()}`;
  const TEST_CONTAINER_NAME = `Datamodels_integration_test_container${randomInt()}`;
  const TEST_VIEW_NAME = `Datamodels_integration_test_view${randomInt()}`;

  const datamodelCreationDefinition: DataModelCreate = {
    externalId: `test_datamodel_${randomInt()}`,
    space: TEST_SPACE_NAME,
    name: 'test_datamodel',
    description: 'Data model used for integration tests.',
    version: '1',
    views: [
      {
        externalId: TEST_VIEW_NAME,
        space: TEST_SPACE_NAME,
        version: '1',
        type: 'view',
      },
    ],
  };

  const viewCreationDefinition: ViewCreateDefinition = {
    externalId: TEST_VIEW_NAME,
    space: TEST_SPACE_NAME,
    name: 'test_view',
    description: 'View used for integration tests.',
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
    jest.setTimeout(30 * 1000);

    client = setupLoggedInClient();
    await deleteOldSpaces(client);
    await client.spaces.upsert([
      {
        space: TEST_SPACE_NAME,
        name: TEST_SPACE_NAME,
        description: 'Instance space used for datamodels integration tests.',
      },
    ]);

    await client.containers.upsert([
      {
        externalId: TEST_CONTAINER_NAME,
        space: TEST_SPACE_NAME,
        name: TEST_CONTAINER_NAME,
        description: 'Container used for datamodels integration tests.',
        properties: {
          test: {
            type: { type: 'text' },
          },
        },
      },
    ]);
    await client.views.upsert([viewCreationDefinition]);
  });

  it('should successfully upsert datamodels', async () => {
    const createdModelResponse = await client.dataModels.upsert([
      datamodelCreationDefinition,
    ]);

    expect(createdModelResponse.items).toHaveLength(1);
    expect(createdModelResponse.items[0].name).toEqual(
      datamodelCreationDefinition.name
    );
  });

  it('should successfully list datamodels', async () => {
    const dataModels = await client.dataModels.list({ limit: 1000 });
    const datamodel = dataModels.items.find(
      (dm) => dm.externalId === datamodelCreationDefinition.externalId
    );
    expect(datamodel).toBeDefined();
  });

  it('should successfully list global datamodels', async () => {
    const dataModels = await client.dataModels.list({
      includeGlobal: true,
      limit: 1000,
    });
    const globalDataModel = dataModels.items.find((dm) => dm.isGlobal);
    expect(globalDataModel).toBeDefined();
  });

  it('should successfully list datamodels via cursor', async () => {
    const datamodels = await client.dataModels
      .list({
        includeGlobal: true,
        limit: 1,
      })
      .autoPagingToArray({ limit: 2 });
    expect(datamodels.length).toBeGreaterThanOrEqual(2);
  });

  it('should successfully retrieve datamodels', async () => {
    const datamodel = await client.dataModels.retrieve([
      {
        space: TEST_SPACE_NAME,
        externalId: datamodelCreationDefinition.externalId,
      },
    ]);
    expect(datamodel.items.length).toBe(1);
    expect(datamodel.items[0].name).toEqual(datamodelCreationDefinition.name);
  });

  it('should successfully delete datamodels', async () => {
    const response = await client.dataModels.delete([
      {
        space: TEST_SPACE_NAME,
        externalId: datamodelCreationDefinition.externalId,
        version: '1',
      },
    ]);
    expect(response.items).toHaveLength(1);

    // Eventual consistency - wait for the delete to propagate
    await new Promise((resolve) => setTimeout(resolve, 20 * 1000));

    const dataModels = await client.dataModels.list({ limit: 1000 });
    expect(
      dataModels.items.find(
        (dm) => dm.externalId === datamodelCreationDefinition.externalId
      )
    ).toBeUndefined();
  });
});
