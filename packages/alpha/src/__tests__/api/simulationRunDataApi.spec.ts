// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('simulation run data api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  test('list simulation run data', async () => {
    const runs = await client.simulators.listRuns({
      limit: 1,
      sort: [
        {
          property: 'createdTime',
          order: 'desc',
        },
      ],
    });

    const runId = runs.items[0].id;

    const runData = await client.simulators.listRunData([
      {
        runId,
      },
    ]);

    expect(runData).toBeDefined();
    expect(runData.length).toBeGreaterThan(0);

    const item = runData[0];

    expect(item.runId).toBe(runId);
  });
});
