// Copyright 2024 Cognite AS

import { DataModelCreate } from 'stable/src/exports.gen';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Data models integration test', () => {
  let client: CogniteClient;
  const timestamp = Date.now();

  const TEST_SPACE_NAME = `Datamodels_integration_test_${timestamp}`;
  const TEST_CONTAINER_NAME = `Datamodels_integration_test_container${timestamp}`;
  const TEST_VIEW_NAME = `Datamodels_integration_test_view${timestamp}`;

  const datamodelCreationDefinition: DataModelCreate = {
    externalId: `test_datamodel_${timestamp}`,
    space: TEST_SPACE_NAME,
    name: 'test_datamodel',
    description: 'Data model used for integration tests.',
    version: '1',
    views: [
      {
        externalId: TEST_VIEW_NAME,
        space: TEST_SPACE_NAME,
        version: '1',
      },
    ],
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
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

    await client.views.upsert([
      {
        externalId: `test_view_${timestamp}`,
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
      },
    ]);
  });
  afterAll(async () => {
    client = setupLoggedInClient();
    await client.views.delete([
      {
        space: TEST_SPACE_NAME,
        externalId: `test_view_${timestamp}`,
        version: '1',
      },
    ]);
    await client.containers.delete([
      { externalId: TEST_CONTAINER_NAME, space: TEST_SPACE_NAME },
    ]);
    await client.spaces.delete([TEST_SPACE_NAME]);
  });

  it('should successfully upsert datamodels', async () => {
    const createdModelResponse = await client.dataModels.upsert([
      datamodelCreationDefinition,
    ]);

    expect(createdModelResponse.items).toHaveLength(2);
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
    expect(response.items).toHaveLength(2);

    const dataModels = await client.dataModels.list({ limit: 1000 });
    expect(
      dataModels.items.find(
        (dm) => dm.externalId === datamodelCreationDefinition.externalId
      )
    ).toBeUndefined();
  });
});
