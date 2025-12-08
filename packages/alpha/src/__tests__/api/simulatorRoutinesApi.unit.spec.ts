import type {
  SimulatorRoutine,
  SimulatorRoutineRevision,
} from 'alpha/src/types';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { routineRevisionConfiguration } from './seed';

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
          externalId: 'routine-1',
          name: 'Test Routine 1',
          modelExternalId: 'model-1',
          simulatorIntegrationExternalId: 'integration-1',
          dataSetId: 1,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          simulatorExternalId: 'simulator-1',
        },
        {
          id: 2,
          externalId: 'routine-2',
          name: 'Test Routine 2',
          modelExternalId: 'model-2',
          simulatorIntegrationExternalId: 'integration-2',
          dataSetId: 2,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          simulatorExternalId: 'simulator-2',
        },
      ] as SimulatorRoutine[],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {
        filter,
      })
      .reply(200, response);

    const result = await client.simulators.listRoutines({
      filter,
    });
    expect(result.items).toEqual(response.items);
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
          externalId: 'routine-1',
          name: 'Test Routine 1',
          modelExternalId: 'model-1',
          simulatorIntegrationExternalId: 'integration-1',
        } as SimulatorRoutine,
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
    expect(result.items).toEqual(response.items);
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
          externalId: 'routine-1',
          name: 'Test Routine 1',
          modelExternalId: 'model-1',
          simulatorIntegrationExternalId: undefined,
          simulatorExternalId: 'simulator-1',
          dataSetId: 1,
          createdByUserId: 'user-1',
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
        } as SimulatorRoutine,
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/routines\/list/, {})
      .reply(200, response);

    const result = await client.simulators.listRoutines();
    expect(result.items.length).toBe(1);
    expect(result.items).toEqual(response.items);
  });

  test('list simulator routine revisions with undefined simulatorIntegrationExternalId', async () => {
    const response = {
      items: [
        {
          id: 1,
          externalId: 'routine-revision-1',
          routineExternalId: 'routine-1',
          modelExternalId: 'model-1',
          simulatorIntegrationExternalId: undefined,
          configuration: routineRevisionConfiguration,
          script: [],
          dataSetId: 1,
          createdByUserId: 'user-1',
          createdTime: new Date(),
          versionNumber: 1,
          simulatorExternalId: 'simulator-1',
        } as SimulatorRoutineRevision,
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
    expect(result.items).toEqual(response.items);
  });
});
