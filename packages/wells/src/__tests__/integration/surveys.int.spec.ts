// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import { SearchWellbores } from 'wells/src/client/model/Wellbore';
import CogniteClient from '../../client/cogniteClient';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('standard filter - list all wellbore trajectories', async () => {
    const assetId = 6305961965985611;
    const trajectories = await client.surveys.listTrajectories(assetId);
    expect(trajectories.length).toBeGreaterThan(0);
    trajectories.forEach(async element => {
      expect(element.assetId).toBe(assetId);
      const rows = await element.rows();
      expect(rows.length).toBe(6);
    });
  });

  test('custom filter - list immediate children wellbores ', async () => {
    const fn: SearchWellbores = async (args: number) =>
      await client.wellbores.listChildren(args);

    const wellId = 2278618537691581;
    const response = await client.wellbores.listChildren(wellId, fn);
    response.forEach(async element => {
      expect(element.parentId).toBe(wellId);
      const trajectories = await element.trajectories();
      expect(trajectories.length).toBeGreaterThanOrEqual(0);
      if (trajectories.length != 0) {
        trajectories.forEach(async element => {
          const rows = await element.rows();
          if (rows.length != 0) {
            expect(rows.length).toBe(6);
          }
        });
      }
    });
  });
});
