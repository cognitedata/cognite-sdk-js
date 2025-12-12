// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('simulator logs api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  test('retrieve simulator log by id', async () => {
    // get the latest failed run which should have a logId
    const filterSimulationRunsRes = await client.simulators.listRuns({
      filter: {
        status: 'success',
      },
      limit: 1,
      sort: [
        {
          property: 'createdTime',
          order: 'desc',
        },
      ],
    });

    const logId = filterSimulationRunsRes.items[0].logId;

    if (!logId) {
      throw new Error('No logId found');
    }

    const retrieveLogsResponse = await client.simulators.retrieveLogs([
      {
        id: logId,
      },
    ]);

    expect(retrieveLogsResponse).toBeDefined();
    expect(retrieveLogsResponse.length).toBe(1);

    const item = retrieveLogsResponse[0];

    expect(item.createdTime).toBeDefined();
    expect(item.dataSetId).toBeDefined();
    expect(item.id).toBe(logId);
    expect(item.lastUpdatedTime).toBeDefined();

    for (const data of item.data) {
      expect(data.timestamp).toBeInstanceOf(Date);
    }
  });
});
