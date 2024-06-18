// Copyright 2023 Cognite AS
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulator logs api', () => {
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

    item.data.forEach((data) => {
      expect(data.timestamp).toBeInstanceOf(Date);
    });
  });
});
