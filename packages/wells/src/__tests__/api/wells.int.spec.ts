// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  // test that the client behaves as stable
  test('get well by asset name', async () => {
    const response = await client.wells.getWellByName('Well A');
    console.log(response);
    //expect(response.length).toBe(1);
  });
});
