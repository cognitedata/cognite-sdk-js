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

  test('get well by asset name', async () => {
    const response = await client.wells.getWellByName('Well A');
    console.log(response);
    expect(response.length).toBe(1);
  });

  test('get well by asset name prefix', async () => {
    const response = await client.wells.getWellsByNamePrefix('Well');
    console.log(response);
    response.forEach(function(well) {
      expect(well.name.startsWith('Well')).toBe(true);
    });
    expect(response.length).toBe(2);
  });

  test('get empty wells array with name suffix', async () => {
    const response = await client.wells.getWellsByNamePrefix('A');
    console.log(response);
    expect(response.length).toBe(0);
  });

  test('get well by asset id', async () => {
    const id = 2278618537691581;
    const response = await client.wells.getWellById(id);
    console.log(response);
    expect(response[0]);
    expect(response.length).toBe(1);
  });
});
