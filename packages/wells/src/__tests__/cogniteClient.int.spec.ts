// Copyright 2020 Cognite AS

import CogniteWellsClient from '../client/cogniteWellsClient';
import { setupLoggedInClient } from './testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  // test that the client behaves as stable
  test('client test', async () => {
    expect(client).not.toBeUndefined();
  });
});
