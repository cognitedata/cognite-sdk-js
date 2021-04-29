// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import {
  Survey,
  SurveyData,
  SurveyDataRequest,
} from 'wells/src/client/model/Survey';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('Get trajectory for a wellbore', async () => {
    const wellboreId: number = 8456650753594878;
    const trajectory: Survey = await client.surveys.getTrajectory(wellboreId);

    expect(trajectory).not.toBeUndefined();

    const metadata = trajectory.metadata;
    expect(metadata).not.toBeUndefined();
    if (metadata) {
      expect(metadata['depthUnit']).toBe('meters');
    }
  });

  test('Get trajectory for a wellbore with 404 Not Found', async () => {
    const wellboreId = 1000000000000;

    await client.surveys.getTrajectory(wellboreId).catch(err => {
      expect(err.status).toBe(404);
      //expect(err.data).toBe(`${wellboreId} doesn't exist`)
    });
  });

  test('Get rows from a trajectory', async () => {
    const wellboreId: number = 8456650753594878;

    const trajectory: Survey = await client.surveys.getTrajectory(wellboreId);

    expect(trajectory).not.toBeUndefined();

    const request: SurveyDataRequest = {
      id: trajectory!.id,
      start: undefined,
      end: undefined,
    };
    const data: SurveyData = await client.surveys.getData(request);

    expect(data).not.toBeUndefined();

    expect(data.id).toBe(trajectory!.id);
    expect(data.rows.length).toBe(3);
    data.rows.forEach(row => {
      expect(row.values.length).toBeGreaterThan(5);
    });
  });

  test('Get rows for a survey with 404 Not Found', async () => {
    const surveyId: number = 1000000000000000;

    const request: SurveyDataRequest = {
      id: surveyId,
      start: undefined,
      end: undefined,
    };

    await client.surveys.getData(request).catch(err => {
      expect(err.status).toBe(400);
    });
  });
});
