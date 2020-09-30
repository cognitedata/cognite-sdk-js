// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteClient from '../../client/cogniteClient';
import { SearchSurveys } from 'wells/src/client/model/Survey';

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

  test('standard filter - list all trajectories and its rows', async () => {
    const wellboreId = 4618298167286402;
    const trajectories = await client.surveys.listTrajectories(wellboreId);
    expect(trajectories.length).toBeGreaterThan(0);
    trajectories.forEach(async element => {
      const rows = await element.rows();
      expect(rows.length).toBe(6);
    });
  });

  test('custom filter - list all trajectories and its rows', async () => {
    const wellboreId = 4618298167286402;

    const fn: SearchSurveys = async (args: number) =>
      await client.surveys.listTrajectories(args);

    const trajectories = await client.surveys.listTrajectories(wellboreId, fn);
    expect(trajectories.length).toBeGreaterThan(0);
    trajectories.forEach(async element => {
      const rows = await element.rows();
      expect(rows.length).toBe(6);
    });
  });

  test('standard filter - Fetch wellbores, their trajectories and rows ', async () => {
    const wellId = 2278618537691581;
    const wellbores = await client.wellbores.listChildren(wellId);
    wellbores.forEach(async wellbore => {
      expect(wellbore.parentId).toBe(wellId);
      const trajectories = await wellbore.trajectories();
      expect(trajectories.length).toBeGreaterThanOrEqual(0);
      if (trajectories.length != 0) {
        trajectories.forEach(async trajectory => {
          const rows = await trajectory.rows();
          if (rows.length != 0) {
            expect(rows.length).toBe(6);
          }
        });
      }
    });
  });

  test('standard filter - synchronous for-loop ', async () => {
    const wellId = 2278618537691581;
    const wellbores = await client.wellbores.listChildren(wellId);
    for (const wellbore of wellbores) {
      const trajectories = await wellbore.trajectories();
      expect(trajectories.length).toBeGreaterThanOrEqual(0);
      if (trajectories.length != 0) {
        for (const trajectory of trajectories) {
          const rows = await trajectory.rows();
          if (rows.length != 0) {
            expect(rows.length).toBe(6);
          }
        }
      }
    }
  });
});
