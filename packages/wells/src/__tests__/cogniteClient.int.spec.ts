// Copyright 2020 Cognite AS

import CogniteClient from '../client/cogniteClient';
import { setupLoggedInClient } from './testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('Wells integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  // test that the client behaves as stable
  test('assets list', async () => {
    const response = await client.assets.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('raw get assets', async () => {
    const response = await client.get(
      '/api/v1/projects/subsurface-test/assets'
    );
    expect(response.data).toHaveProperty('items');
  });
});
