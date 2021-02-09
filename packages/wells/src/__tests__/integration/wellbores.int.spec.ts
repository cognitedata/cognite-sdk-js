// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';

import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { Measurement} from 'wells/src/client/model/Measurement';
import { Well } from 'wells/src/client/model/Well';
import { Wellbore } from 'wells/src/client/model/Wellbore';
import { Survey, SurveyData } from 'wells/src/client/model/Survey';
import { Asset } from 'wells/src/types';

enum MeasurementType {
  GammaRay = 'GammaRay',
  Caliper = 'Caliper',
  Resistivity = 'Resistivity',
  Density = 'Density',
  Neutron = 'Neutron',
  PPFG = 'PPFG',
  Geomechanics = 'Geomechanics',
  Core = 'Core',
}

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

    test('Succeed to get wellbore by its id', async () => {
      const wellboreId: number = 8456650753594878;
      const wellbore: Wellbore | undefined = await client.wellbores.getById(wellboreId).then(response => response).catch(err => err);
      expect(wellbore).not.toBeUndefined();
      /* eslint-disable */
      expect(wellbore?.id).toBe(wellboreId);
      const trajectory: Survey | undefined = await wellbore?.trajectory();
      expect(trajectory).not.toBeUndefined();
      const data: SurveyData | undefined = await trajectory?.data();
      expect(data).not.toBeUndefined();
    });

    test('get source assets for wellbore', async () => {
      expect(client).not.toBeUndefined();
      const wellId: number = 8269456345006483;
      const wellbore: Wellbore | undefined = await client.wellbores.getById(wellId)
      const sources: Asset[] | undefined = await wellbore?.sourceAssets()
      expect(sources).not.toBeUndefined();
      expect(sources?.length).toBe(1);
      const source = sources![0];
      expect(source.externalId).toBe("EDM:Wellbore:vUUnhh02Jz")
    });
  
    test('get source assets for wellbore of type EDM', async() => {
      const wellId: number = 8269456345006483;
      const wellbore: Wellbore | undefined = await client.wellbores.getById(wellId)
      const sources = await wellbore?.sourceAssets("EDM")
      expect(sources).not.toBeUndefined();
      expect(sources?.length).toBe(1);
      const source = sources![0];
      expect(source.externalId).toBe("EDM:Wellbore:vUUnhh02Jz")
    });

    test('Succeed to get wellbore measurement for measurementType: GammaRay', async () => {
      const wellboreId: number = 870793324939646;
      const measurements: Measurement[] | undefined = await client.wellbores.getMeasurement(
        wellboreId,
        MeasurementType.GammaRay
      );
      expect(measurements).not.toBeUndefined();
      /* eslint-disable */
      expect(measurements?.length).toBe(2);

      if (measurements) {

      // sync
      for (var measurement of measurements) {
        const data: SurveyData = await measurement.data();
        expect(data.rows.length).toBe(6);
      }

      // async
      measurements.forEach(async measurement => {
        const data: SurveyData = await measurement.data()
        expect(data.rows.length).toBe(6);
      })
    }
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

    test('Get wellbores for a well id', async () => {
      const well: Well | undefined = await client.wells.getById(2275887128760800);
      expect(well).not.toBeUndefined();
      
      const wellbores: Wellbore[] | undefined = await client.wellbores.getFromWell(well!.id).then(response => response).catch(err => err);

      expect(wellbores).not.toBeUndefined();
      const wellboreIds = [870793324939646, 1072803479704457, 8456650753594878]
      wellboreIds.forEach(id => {
        expect(wellbores!.map(wellbore => wellbore.id)).toContain(id)
      });
    })


    test('Get wellbores from multiple well ids', async () => {

      const wellIds: number[] = [2457499785650331, 2275887128760800]
      
      const wellbores: Wellbore[] | undefined = await client.wellbores.getFromWells(wellIds).then(response => response).catch(err => err);

      expect(wellbores).not.toBeUndefined();
      const wellboreIds = [870793324939646, 1072803479704457, 8456650753594878, 4331964628426904]
      wellboreIds.forEach(id => {
        expect(wellbores!.map(wellbore => wellbore.id)).toContain(id)
      });
    })
  }
);
