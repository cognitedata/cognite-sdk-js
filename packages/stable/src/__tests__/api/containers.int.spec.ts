// Copyright 2024 Cognite AS

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ContainerCreateDefinition } from '../../api/containers/types.gen';
import type CogniteClient from '../../cogniteClient';
import { deleteOldSpaces, randomInt, setupLoggedInClient } from '../testUtils';

describe('Containers integration test', () => {
  let client: CogniteClient;

  const TEST_SPACE_NAME = `Containers_integration_test_${randomInt()}`;

  const containerCreationDefinition: ContainerCreateDefinition = {
    externalId: `test_container_${randomInt()}`,
    space: TEST_SPACE_NAME,
    name: 'test_container',
    description: 'Container used for integration tests.',
    properties: {
      test: {
        type: { type: 'text' },
      },
    },
  };
  const containerCreationDefinition2: ContainerCreateDefinition = {
    externalId: `test_container_2_${randomInt()}`,
    space: TEST_SPACE_NAME,
    name: 'test_data_space_2',
    description: 'Instance space used for integration tests.',
    properties: {
      test: {
        type: { type: 'text' },
      },
    },
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await deleteOldSpaces(client);
    await client.spaces.upsert([
      {
        space: TEST_SPACE_NAME,
        name: TEST_SPACE_NAME,
        description: 'Instance space used for containers integration tests.',
      },
    ]);
  });
  afterAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.delete([TEST_SPACE_NAME]);
  });
  it('should successfully upsert containers', async () => {
    const createdContainerResponse = await client.containers.upsert([
      containerCreationDefinition,
      containerCreationDefinition2,
    ]);

    expect(createdContainerResponse.items).toHaveLength(2);
    expect(createdContainerResponse.items[0].name).toEqual(
      containerCreationDefinition.name,
    );
    expect(createdContainerResponse.items[0].externalId).toEqual(
      containerCreationDefinition.externalId,
    );
    expect(createdContainerResponse.items[1].name).toEqual(
      containerCreationDefinition2.name,
    );
    expect(createdContainerResponse.items[1].externalId).toEqual(
      containerCreationDefinition2.externalId,
    );
  });

  it('should successfully list Containers', async () => {
    const Containers = await client.containers.list({ limit: 1000 });
    const Container1 = Containers.items.find(
      (container) =>
        container.externalId === containerCreationDefinition.externalId,
    );
    const Container2 = Containers.items.find(
      (container) =>
        container.externalId === containerCreationDefinition2.externalId,
    );
    expect(Container1).toBeDefined();
    expect(Container2).toBeDefined();
  });

  it('should successfully list global Containers', async () => {
    const Containers = await client.containers.list({
      includeGlobal: true,
      limit: 1000,
    });
    const globalContainer = Containers.items.find(
      (container) => container.isGlobal,
    );
    expect(globalContainer).toBeDefined();
  });

  it('should successfully list Containers via cursor', async () => {
    const Containers = await client.containers
      .list({
        includeGlobal: true,
        limit: 1,
      })
      .autoPagingToArray({ limit: 2 });
    expect(Containers.length).toBeGreaterThanOrEqual(2);
  });

  it('should successfully retrieve Containers', async () => {
    const containers = await client.containers.retrieve([
      {
        space: TEST_SPACE_NAME,
        externalId: containerCreationDefinition.externalId,
      },
      {
        space: TEST_SPACE_NAME,
        externalId: containerCreationDefinition2.externalId,
      },
    ]);
    expect(containers.items.length).toBe(2);
    expect(containers.items[0].name).toEqual(containerCreationDefinition.name);
    expect(containers.items[1].name).toEqual(containerCreationDefinition2.name);
  });

  it(
    'should successfully delete Containers',
    async () => {
      const response = await client.containers.delete([
        {
          space: TEST_SPACE_NAME,
          externalId: containerCreationDefinition.externalId,
        },
        {
          space: TEST_SPACE_NAME,
          externalId: containerCreationDefinition2.externalId,
        },
      ]);
      expect(response.items).toHaveLength(2);

      // Eventual consistency - wait for the delete to propagate
      await new Promise((resolve) => setTimeout(resolve, 20 * 1000));

      vi.waitFor(
        async () => {
          const containers = await client.containers.list({ limit: 1000 });
          expect(
            containers.items.find(
              (container) =>
                container.externalId === containerCreationDefinition.externalId,
            ),
          ).toBeUndefined();
          expect(
            containers.items.find(
              (container) =>
                container.externalId ===
                containerCreationDefinition2.externalId,
            ),
          ).toBeUndefined();
        },
        {
          timeout: 25 * 1000,
          interval: 1000,
        },
      );
    },
    25 * 1000,
  );
});
