// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';

import CogniteWellsClient from 'wells/src/client/CogniteWellsClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition(
  'CogniteClient setup in wellbores - integration test',
  () => {
    let client: CogniteWellsClient;
    beforeAll(async () => {
      client = setupLoggedInClient();
    });

    test('standard filter - list all wellbores', async () => {
      expect(client).not.toBeUndefined();
    });
  }
);
