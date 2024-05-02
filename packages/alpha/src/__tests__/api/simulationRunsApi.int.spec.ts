// Copyright 2023 Cognite AS
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulator integrations api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  const ts = Date.now();
  let runId = 0;

  test('run a simulation', async () => {
    const res = await client.simulators.runSimulation([
      {
        routineExternalId: 'ShowerMixerWithExtendedIO',
        runType: 'external',
        runTime: new Date(ts),
        queue: true,
      },
    ]);
    runId = res[0].id;
    expect(runId).toBeGreaterThan(0);

    expect(res).toBeDefined();
    expect(res.length).toBe(1);

    const item = res[0];

    expect(item.simulatorName).toBe('DWSIM');
    expect(item.modelName).toBe('Shower Mixer');
    expect(item.routineName).toBe(
      'Shower Mixer With Extended Inputs / Outputs'
    );
    expect(item.status).toBe('ready');
    expect(item.runType).toBe('external');
    expect(item.runTime?.valueOf()).toBe(ts);
    expect(item.createdTime.valueOf()).toBeGreaterThanOrEqual(ts);
    expect(item.lastUpdatedTime.valueOf()).toBeGreaterThanOrEqual(ts);
  });

  test('list simulation runs', async () => {
    const res = await client.simulators.listRuns({
      filter: {
        simulatorName: 'DWSIM',
        status: 'success',
        createdTime: {
          max: new Date(),
        },
      },
      sort: [
        {
          property: 'createdTime',
          order: 'desc',
        },
      ],
    });

    expect(res).toBeDefined();
    expect(res.items.length).toBeGreaterThan(0);

    const item = res.items[0];

    expect(item.simulatorName).toBe('DWSIM');
    expect(item.status).toBe('success');
    expect(item.createdTime.valueOf()).toBeGreaterThan(0);
    expect(item.lastUpdatedTime.valueOf()).toBeGreaterThan(0);
  });

  test('retrieve simulation run by id', async () => {
    expect(runId).toBeGreaterThan(0);

    const res = await client.simulators.retrieveRuns([runId]);

    expect(res).toBeDefined();
    expect(res.length).toBe(1);

    const item = res[0];

    expect(item.simulatorName).toBe('DWSIM');
    expect(item.status).toBe('ready');
    expect(item.id).toBe(runId);
  });
});
