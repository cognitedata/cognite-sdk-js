// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';

import CogniteWellsClient from 'wells/src/client/CogniteWellsClient';
import { MeasurementType } from 'wells/src/client/model/MeasurementType';
import { Measurements } from 'wells/src/client/model/Measurement';

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

    test('Succeed to get wellbore measurement for measurementType: GammaRay', async () => {
      const wellboreId: number = 870793324939646;
      const measurements: Measurements | undefined = await client.wellbores.getMeasurement(
        wellboreId,
        MeasurementType.GammaRay
      );
      expect(measurements).not.toBeUndefined();
      /* eslint-disable */
      expect(measurements?.items.length).toBe(2);
    });

    test('Fail to get wellbore measurement for measurementType: GammaRay', async () => {
      const wellboreId: number = 870793324939640;

      await client.wellbores
        .getMeasurement(wellboreId, MeasurementType.GammaRay)
        .then(response => response)
        .catch(err => {
          expect(err.status).toBe(404);
        });
    });
  }
);
