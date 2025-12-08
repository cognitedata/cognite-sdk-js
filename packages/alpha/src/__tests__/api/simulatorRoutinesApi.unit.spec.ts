import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { routineRevisionConfiguration, routineRevisionScript } from './seed';

describe('Simulator Routines API unit tests', () => {
  let client: CogniteClientAlpha;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('list routines with simulatorExternalIds filter', async () => {
    const filter = {
      simulatorExternalIds: ['simulator-1', 'simulator-2'],
    };
    const response = {
      items: [
        {
          id: 1,
          externalId: 'test_sim_routine_1',
          simulatorExternalId: 'test_sim_1',
          modelExternalId: 'test_model_1',
          simulatorIntegrationExternalId: 'test_sim_integration_1',
          name: 'Test Routine 1',
          dataSetId: 1,
          createdTime: 1765203279461,
          lastUpdatedTime: 1765203279461,
        },
        {
          id: 1,
          externalId: 'test_sim_routine_2',
          simulatorExternalId: 'test_sim_1',
          modelExternalId: 'test_model_1',
          simulatorIntegrationExternalId: 'test_sim_integration_1',
          name: 'Test Routine 2',
          dataSetId: 1,
          createdTime: 1765203279461,
          lastUpdatedTime: 1765203279461,
        },
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {
        filter,
      })
      .reply(200, response);

    const result = await client.simulators.listRoutines({
      filter,
    });
    const mockedResponse = response.items.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
      lastUpdatedTime: new Date(item.lastUpdatedTime),
    }));
    expect(result.items).toEqual(mockedResponse);
    expect(result.items.length).toBe(2);
  });

  test('list routines with all filters combined', async () => {
    const filter = {
      simulatorExternalIds: ['simulator-1'],
      simulatorIntegrationExternalIds: ['integration-1'],
      modelExternalIds: ['model-1'],
    };
    const response = {
      items: [
        {
          id: 1,
          externalId: 'test_sim_routine_1',
          simulatorExternalId: 'test_sim_1',
          modelExternalId: 'test_model_1',
          simulatorIntegrationExternalId: 'test_sim_integration_1',
          name: 'Test Routine 1',
          dataSetId: 1,
          createdTime: 1765203279461,
          lastUpdatedTime: 1765203279461,
        },
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {
        filter,
      })
      .reply(200, response);

    const result = await client.simulators.listRoutines({
      filter,
    });
    const mockedResponse = response.items.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
      lastUpdatedTime: new Date(item.lastUpdatedTime),
    }));
    expect(result.items).toEqual(mockedResponse);
    expect(result.items.length).toBe(1);
  });

  test('list routines with simulatorExternalIds filter - empty result', async () => {
    const filter = {
      simulatorExternalIds: ['non-existent-simulator'],
    };
    const response = {
      items: [],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {
        filter,
      })
      .reply(200, response);

    const result = await client.simulators.listRoutines({
      filter,
    });
    expect(result.items).toEqual([]);
    expect(result.items.length).toBe(0);
  });

  test('list simulator routines with undefined simulatorIntegrationExternalId', async () => {
    const response = {
      items: [
        {
          id: 1,
          externalId: 'test_sim_routine_1',
          simulatorExternalId: 'test_sim_1',
          modelExternalId: 'test_model_1',
          simulatorIntegrationExternalId: 'test_sim_integration_1',
          name: 'Test Routine 1',
          dataSetId: 1,
          createdTime: 1765203279461,
          lastUpdatedTime: 1765203279461,
        },
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {})
      .reply(200, response);

    const result = await client.simulators.listRoutines();
    expect(result.items.length).toBe(1);
    const mockedResponse = response.items.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
      lastUpdatedTime: new Date(item.lastUpdatedTime),
    }));
    expect(result.items).toEqual(mockedResponse);
  });

  test('list simulator routine revisions with undefined simulatorIntegrationExternalId', async () => {
    const response = {
      items: [
        {
          id: 1,
          externalId: 'test_sim_routine_revision_1',
          routineExternalId: 'test_sim_routine_1',
          modelExternalId: 'test_model_1',
          simulatorIntegrationExternalId: 'test_sim_integration_1',
          configuration: routineRevisionConfiguration,
          script: routineRevisionScript,
          simulatorExternalId: 'test_sim_1',
          dataSetId: 1,
          createdByUserId: 'test_user_1',
          createdTime: 1765203279461,
          versionNumber: 1,
        },
      ],
    };

    nock(mockBaseUrl)
      .post(
        /\/api\/v1\/projects\/.*\/simulators\/routines\/revisions\/list/,
        {}
      )
      .reply(200, response);

    const result = await client.simulators.listRoutineRevisions();
    expect(result.items.length).toBe(1);
    const mockedResponse = response.items.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
    }));
    expect(result.items).toEqual(mockedResponse);
  });
});
