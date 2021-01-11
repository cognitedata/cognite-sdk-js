// Copyright 2020 Cognite AS

import { createWellsClient } from '../client/clientCreateUtils';
import { authTokens } from './testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in wells - integration test', () => {
  // test api-key login
  test('api-key login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    client.loginWithApiKey({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      apiKey: process.env.COGNITE_WELLS_CREDENTIALS as string,
    });

    expect(client.isLoggedIn).toBe(true);
  });

  // test api-key login
  test('bearer-token login', async () => {
    const client = createWellsClient('WELLS TEST CLIENT');
    expect(client.isLoggedIn).toBe(false);

    client.loginWithToken({
      project: process.env.COGNITE_WELLS_PROJECT as string,
      accessToken: authTokens.accessToken,
    });

    expect(client.isLoggedIn).toBe(true);
  });
});
