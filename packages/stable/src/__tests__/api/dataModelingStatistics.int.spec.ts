// Copyright 2026 Cognite AS

import { beforeAll, describe, expect, it } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { TEST_DATA_SPACE, setupLoggedInClient } from '../testUtils';

const countAndLimit = {
  count: expect.any(Number),
  limit: expect.any(Number),
};

const spaceStatisticsShape = {
  space: TEST_DATA_SPACE,
  containers: expect.any(Number),
  views: expect.any(Number),
  dataModels: expect.any(Number),
  nodes: expect.any(Number),
  edges: expect.any(Number),
  softDeletedNodes: expect.any(Number),
  softDeletedEdges: expect.any(Number),
};

describe('Data modeling statistics integration test', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.spaces.upsert([
      {
        space: TEST_DATA_SPACE,
        name: TEST_DATA_SPACE,
        description: 'Instance space used for integration tests.',
      },
    ]);
  });

  it('should retrieve project-wide statistics', async () => {
    const statistics = await client.dataModelingStatistics.project();

    expect(statistics).toMatchObject({
      spaces: countAndLimit,
      containers: countAndLimit,
      views: countAndLimit,
      dataModels: countAndLimit,
      containerProperties: countAndLimit,
      instances: {
        edges: expect.any(Number),
        softDeletedEdges: expect.any(Number),
        nodes: expect.any(Number),
        softDeletedNodes: expect.any(Number),
        instances: expect.any(Number),
        instancesLimit: expect.any(Number),
        softDeletedInstances: expect.any(Number),
        softDeletedInstancesLimit: expect.any(Number),
      },
      concurrentReadLimit: expect.any(Number),
      concurrentWriteLimit: expect.any(Number),
      concurrentDeleteLimit: expect.any(Number),
    });
    expect(statistics.spaces.count).toBeGreaterThan(0);
  });

  it('should list statistics for all spaces', async () => {
    const { items } = await client.dataModelingStatistics.listSpaces();

    const testSpace = items.find((item) => item.space === TEST_DATA_SPACE);
    expect(testSpace).toMatchObject(spaceStatisticsShape);
  });

  it('should retrieve statistics for given spaces', async () => {
    const { items } = await client.dataModelingStatistics.retrieveSpaces([
      TEST_DATA_SPACE,
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject(spaceStatisticsShape);
  });
});
