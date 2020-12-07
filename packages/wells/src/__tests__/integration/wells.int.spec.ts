// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import WellsClient from 'wells/src/client/CogniteWellsClient';
import { Well } from 'wells/src/client/model/Well';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  let client: WellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('standard filter - get well by asset name', async () => {
<<<<<<< HEAD
=======
<<<<<<< Updated upstream
    expect(client).not.toBeUndefined();
=======
>>>>>>> fce54e71... chore: merge
    // console.log('client: ', client);

    // console.log('wells: ', client.wells);
    const a: Well[] | undefined = await client.wells.list();
    console.log(a);
  });

  test('standard filter - get well from a polygon', async () => {
    const a: Well[] | undefined = await client.wells.filter({});
    console.log(a);
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
>>>>>>> fce54e71... chore: merge
  });
});
