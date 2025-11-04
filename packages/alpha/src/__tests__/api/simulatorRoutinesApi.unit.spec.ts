import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

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
        },
        {
          id: 2,
          externalId: 'routine-2',
          name: 'Test Routine 2',
          modelExternalId: 'model-2',
          simulatorIntegrationExternalId: 'integration-2',
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
});
