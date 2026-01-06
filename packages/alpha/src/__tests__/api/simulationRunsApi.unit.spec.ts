import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Simulator Runs API unit tests', () => {
  let client: CogniteClientAlpha;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('list simulation runs with undefined simulatorIntegrationExternalId', async () => {
    const mockedResponse = {
      items: [
        {
          id: 1,
          simulatorExternalId: 'simulator-1',
          simulatorIntegrationExternalId: undefined,
          modelExternalId: 'model-1',
          routineExternalId: 'routine-1',
          routineRevisionExternalId: 'routine-revision-1',
          status: 'success',
          runTime: 1765203279461,
          simulationTime: 1765203279461,
          statusMessage: 'Test Status Message',
          dataSetId: 1,
          eventId: 1,
          runType: 'external',
          logId: 1,
          createdTime: 1765203279461,
          lastUpdatedTime: 1765203279461,
          modelRevisionExternalId: 'model-revision-1',
        },
      ],
    };

    nock(mockBaseUrl)
      .post(/\/api\/v1\/projects\/.*\/simulators\/runs\/list/, {})
      .reply(200, mockedResponse);

    const result = await client.simulators.listRuns();
    expect(result.items.length).toBe(1);
    const expectedResponse = mockedResponse.items.map((item) => ({
      ...item,
      createdTime: new Date(item.createdTime),
      lastUpdatedTime: new Date(item.lastUpdatedTime),
      runTime: new Date(item.runTime),
      simulationTime: new Date(item.simulationTime),
    }));
    expect(result.items).toEqual(expectedResponse);
    expect(result.items[0].simulatorIntegrationExternalId).toBeUndefined();
  });
});
