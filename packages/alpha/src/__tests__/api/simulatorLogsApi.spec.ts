// Copyright 2023 Cognite AS
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulator logs api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  const ts = Date.now();

  test('retrieve simulator log by id', async () => {
    const runSimulationRes = await client.simulators.runSimulation([
      {
        routineExternalId: 'ShowerMixerIntegrationTestConstInputs',
        runType: 'external',
        validationEndTime: new Date(ts),
        queue: true,
      },
    ]);
    const runId = runSimulationRes[0].id;
    const retrieveRunsResponse = await client.simulators.retrieveRuns([runId]);
    const logId = retrieveRunsResponse[0].logId;

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
    expect(item.data).toBeInstanceOf(Array);
  });
});
