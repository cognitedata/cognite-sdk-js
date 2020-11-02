// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('standard filter - list all wellbore trajectories', async () => {
    const response = await client.wellbores.listAll();
    const wellboreId = response[0].id;
    const trajs = await client.surveys.listTrajectories(wellboreId);
    expect(trajs.length).toBe(0);
  });
});
