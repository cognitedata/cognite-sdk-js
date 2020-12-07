// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/CogniteWellsClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: WellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
    console.log(client);
  });

  test('standard filter - get well by asset name', async () => {
    console.log('client: ', client);

    console.log('wells: ', client.wells);
    client.wells.list();
  });
});
