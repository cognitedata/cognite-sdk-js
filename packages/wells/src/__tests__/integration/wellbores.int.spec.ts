// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition(
  'CogniteClient setup in wellbores - integration test',
  () => {
    let client: CogniteClient;
    beforeAll(async () => {
      client = setupLoggedInClient();
    });

    test('get all wellbores', async () => {
      const response = await client.wellbores.list();

      expect(response.items.length).toBe(1);
    });

    test('get child wellbores', async () => {
      const response = await client.wellbores.list();

      expect(response.items.length).toBe(1);
    });

    test('get all wellbores for a well', async () => {
      const response = await client.wellbores.list();

      expect(response.items.length).toBe(1);
    });
  }
);
