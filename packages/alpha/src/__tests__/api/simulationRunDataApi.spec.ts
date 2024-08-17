import { describe, expect, test } from 'vitest';
// Copyright 2023 Cognite AS
import type CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS === 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulation run data api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  test('list simulation run data', async () => {
    const runs = await client.simulators.listRuns({
      filter: {
        simulatorExternalIds: ['DWSIM'],
        status: 'success',
      },
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
