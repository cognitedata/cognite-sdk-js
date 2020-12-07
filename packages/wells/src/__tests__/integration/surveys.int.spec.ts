// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/CogniteWellsClient';
import { Survey } from 'wells/src/client/model/Survey';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('Get trajectory for a wellbore', async () => {
    const wellboreId: number = 8456650753594878;
    const trajectory: Survey = await client.wellbores.getTrajectory(wellboreId)
      .then(response => response)
      .catch(err => err);

      console.log(trajectory);

    expect(trajectory).not.toBeUndefined();
    /* eslint-disable */
    expect(trajectory?.id).toBe(5289118434026779);
  });

  test('Get trajectory for a wellbore with 404 Not Found', async () => {
    const wellboreId: number = 1000000000000;

   await client.wellbores.getTrajectory(wellboreId)
      .then(response => response)
      .catch(err => expect(err.status).toBe(404));
  });
});
