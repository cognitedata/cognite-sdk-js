// Copyright 2024 Cognite AS

import type {
  DataModelCreate,
  ViewCreateDefinition,
  ViewDefinition,
} from 'stable/src/types';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import {
  deleteOldSpaces,
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

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
    client = setupLoggedInClient();

    vi.setConfig({ testTimeout: 30 * 1000 });
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
  }, 25_000);

  it('should successfully upsert datamodels', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const createdModelResponse = await client.dataModels.upsert([
        datamodelCreationDefinition,
      ]);

      expect(createdModelResponse.items).toHaveLength(1);
      expect(createdModelResponse.items[0].name).toEqual(
        datamodelCreationDefinition.name
      );
    });
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
    expect(datamodel.items[0].views).toBeDefined();

    // Incorrect type cast to check for negative case (ensuring no 'properties' field)
    const view = datamodel.items?.[0]?.views?.[0] as ViewDefinition;
    expect(view?.externalId).toEqual(TEST_VIEW_NAME);
    expect(view?.space).toEqual(TEST_SPACE_NAME);
    expect(view?.properties).not.toBeDefined();
  });

  it('should include views when retrieving datamodels', async () => {
    const datamodel = await client.dataModels.retrieve(
      [
        {
          space: TEST_SPACE_NAME,
          externalId: datamodelCreationDefinition.externalId,
        },
      ],
      {
        inlineViews: true,
      }
    );

    expect(datamodel.items.length).toBe(1);
    expect(datamodel.items[0].views).toBeDefined();
    expect(datamodel.items[0].views).toHaveLength(1);

    const view = datamodel.items?.[0]?.views?.[0] as ViewDefinition;

    expect(view?.externalId).toEqual(TEST_VIEW_NAME);
    expect(view?.space).toEqual(TEST_SPACE_NAME);
    expect(view?.properties).toBeDefined();
  });

  it(
    'should successfully delete datamodels',
    async () => {
      const response = await client.dataModels.delete([
        {
          space: TEST_SPACE_NAME,
          externalId: datamodelCreationDefinition.externalId,
          version: '1',
        },
      ]);
      expect(response.items).toHaveLength(1);

      // Eventual consistency
      await vi.waitFor(
        async () => {
          const dataModels = await client.dataModels.list({ limit: 1000 });
          expect(
            dataModels.items.find(
              (dm) => dm.externalId === datamodelCreationDefinition.externalId
            )
          ).toBeUndefined();
        },
        {
          timeout: 25 * 1000,
          interval: 1000,
        }
      );
    },
    25 * 1000
  );
});
