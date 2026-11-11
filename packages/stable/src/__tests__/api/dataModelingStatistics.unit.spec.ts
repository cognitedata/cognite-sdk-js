// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ProjectStatistics,
  SpaceStatisticsResponseList,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const projectStatistics: ProjectStatistics = {
  spaces: { count: 10, limit: 100 },
  containers: { count: 20, limit: 1000 },
  views: { count: 30, limit: 2000 },
  dataModels: { count: 5, limit: 500 },
  containerProperties: { count: 200, limit: 25000 },
  recordsOnlyContainers: { count: 2, limit: 10 },
  recordsOnlyContainerProperties: { count: 40, limit: 1000 },
  instances: {
    edges: 100,
    softDeletedEdges: 1,
    nodes: 200,
    softDeletedNodes: 2,
    instances: 300,
    instancesLimit: 5000000,
    softDeletedInstances: 3,
    softDeletedInstancesLimit: 10000000,
  },
  concurrentReadLimit: 32,
  concurrentWriteLimit: 16,
  concurrentDeleteLimit: 8,
};

const spaceStatistics: SpaceStatisticsResponseList = {
  items: [
    {
      space: 'my_space',
      containers: 2,
      containerProperties: 20,
      views: 3,
      dataModels: 1,
      nodes: 100,
      edges: 50,
      softDeletedNodes: 1,
      softDeletedEdges: 0,
      recordsOnlyContainers: 1,
      recordsOnlyContainerProperties: 5,
    },
  ],
};

describe('Data modeling statistics unit test', () => {
  let client: CogniteClient;
  const statisticsPath = (path = '') =>
    `/api/v1/projects/${client.project}/models/statistics${path}`;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('project retrieves project-wide statistics', async () => {
    const scope = nock(mockBaseUrl)
      .get(statisticsPath())
      .reply(200, projectStatistics);

    const response = await client.dataModelingStatistics.project();

    expect(response).toEqual(projectStatistics);
    expect(scope.isDone()).toBe(true);
  });

  test('listSpaces retrieves statistics for all spaces', async () => {
    const scope = nock(mockBaseUrl)
      .get(statisticsPath('/spaces'))
      .reply(200, spaceStatistics);

    const response = await client.dataModelingStatistics.listSpaces();

    expect(response).toEqual(spaceStatistics);
    expect(scope.isDone()).toBe(true);
  });

  test('retrieveSpaces retrieves statistics for the given spaces', async () => {
    const scope = nock(mockBaseUrl)
      .post(statisticsPath('/spaces/byids'), {
        items: [{ space: 'my_space' }],
      })
      .reply(200, spaceStatistics);

    const response = await client.dataModelingStatistics.retrieveSpaces([
      'my_space',
    ]);

    expect(response).toEqual(spaceStatistics);
    expect(scope.isDone()).toBe(true);
  });
});
