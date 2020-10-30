// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';
import { SearchWellbores } from 'wells/src/client/model/Wellbore';
//import { SearchWellbores, SearchWellbore } from 'wells/src/client/model/Wellbore';
//import { assert } from 'console';

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

    test('standard filter - get all wellbores', async () => {
      const response = await client.wellbores.listAll();
      expect(response.length).toBe(5);
    });

    test('custom filter - get all wellbores', async () => {
      const fn: SearchWellbores = async () => await client.wellbores.listAll();

      const response = await client.wellbores.listAll(fn);
      expect(response.length).toBe(5);
    });
  }
);
