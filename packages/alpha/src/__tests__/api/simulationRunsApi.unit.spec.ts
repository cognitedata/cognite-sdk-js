import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import type { SimulationRun } from '../../types';
import { setupMockableClient } from '../testUtils';

describe('Simulator Runs API unit tests', () => {
  let client: CogniteClientAlpha;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('list simulation runs with undefined simulatorIntegrationExternalId', async () => {
    const response = {
      items: [
        {
          id: 1,
          simulatorExternalId: 'simulator-1',
          simulatorIntegrationExternalId: undefined,
          modelExternalId: 'model-1',
          routineExternalId: 'routine-1',
          routineRevisionExternalId: 'routine-revision-1',
          status: 'success',
          runTime: new Date(),
          simulationTime: new Date(),
          statusMessage: 'Test Status Message',
          dataSetId: 1,
          eventId: 1,
          runType: 'external',
          logId: 1,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          modelRevisionExternalId: 'model-revision-1',
        } as SimulationRun,
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/runs\/list/, {})
      .reply(200, response);

    const result = await client.simulators.listRuns();
    expect(result.items.length).toBe(1);
    expect(result.items[0].simulatorIntegrationExternalId).toBeUndefined();
  });
});
