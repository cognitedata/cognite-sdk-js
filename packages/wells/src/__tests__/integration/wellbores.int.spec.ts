// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';

import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { Measurement } from 'wells/src/client/model/Measurement';
import { Well } from 'wells/src/client/model/Well';
import { Wellbore } from 'wells/src/client/model/Wellbore';
import { Survey, SurveyData } from 'wells/src/client/model/Survey';
import { Asset } from '@cognite/sdk';

enum MeasurementType {
  GammaRay = 'GammaRay',
  Caliper = 'Caliper',
  ResistivityDeep = 'ResistivityDeep',
  ResistivityMedium = 'ResistivityMedium',
  Density = 'Density',
  Neutron = 'Neutron',
  PPFG = 'PPFG',
  Geomechanics = 'Geomechanics',
  FIT = 'FIT',
  LOT = 'LOT',
}

const casingWearWellboreId = 8269456345006483;

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
      const wellboreId = 8456650753594878;
      const wellbore: Wellbore = await client.wellbores.getById(wellboreId);
      expect(wellbore).not.toBeUndefined();
      expect(wellbore.id).toBe(wellboreId);
      const trajectory: Survey = await wellbore.trajectory();
      expect(trajectory).not.toBeUndefined();
      const data: SurveyData = await trajectory.data();
      expect(data).not.toBeUndefined();
    });

    test('get source assets for wellbore', async () => {
      const wellId: number = casingWearWellboreId;
      const wellbore: Wellbore = await client.wellbores.getById(wellId);
      const sources: Asset[] = await wellbore.sourceAssets();
      expect(sources).not.toBeUndefined();
      expect(sources.length).toBe(1);
      const source = sources![0];
      expect(source.externalId).toBe('EDM:Wellbore:vUUnhh02Jz');

      const sourceWellbores = wellbore.sourceWellbores;
      expect(sourceWellbores.length).toBeGreaterThanOrEqual(1);
      const sourceWellbore = sourceWellbores[0];
      expect(sourceWellbore.externalId).toBeTruthy();
      expect(sourceWellbore.id).toBeTruthy();
      expect(sourceWellbore.source).toBeTruthy();
    });

    test('get sourceWellbores for wellbore', async () => {
      const wellbore = await client.wellbores.getById(casingWearWellboreId);
      const sourceWellbores = wellbore.sourceWellbores;
      expect(sourceWellbores.length).toBeGreaterThanOrEqual(1);
      const sourceWellbore = sourceWellbores[0];
      expect(sourceWellbore.externalId).toBeTruthy();
      expect(sourceWellbore.id).toBeTruthy();
      expect(sourceWellbore.source).toBeTruthy();
    });

    test('get source assets for wellbore of type EDM', async () => {
      const wellId: number = casingWearWellboreId;
      const wellbore: Wellbore = await client.wellbores.getById(wellId);
      const sources = await wellbore.sourceAssets('EDM');
      expect(sources).not.toBeUndefined();
      expect(sources.length).toBe(1);
      const source = sources![0];
      expect(source.externalId).toBe('EDM:Wellbore:vUUnhh02Jz');
    });

    test('Succeed to get wellbore measurement for measurementType: GammaRay', async () => {
      const wellboreId = 870793324939646;
      const measurements: Measurement[] = await client.wellbores.getMeasurement(
        wellboreId,
        MeasurementType.GammaRay
      );
      expect(measurements).not.toBeUndefined();

      expect(measurements.length).toBe(2);

      for (const measurement of measurements) {
        const data: SurveyData = await measurement.data();
        expect(data.rows.length).toBe(6);
      }
    });

    test('Fail to get wellbore measurement for measurementType: GammaRay', async () => {
      const wellboreId: number = 870793324939640;

      await client.wellbores
        .getMeasurement(wellboreId, MeasurementType.GammaRay)
        .catch(err => {
          expect(err.status).toBe(404);
        });
    });

    test('Get wellbores for a well id', async () => {
      const well: Well = await client.wells.getById(8091617722352417);
      expect(well).not.toBeUndefined();

      const wellbores: Wellbore[] = await client.wellbores.getFromWell(well.id);

      expect(wellbores).not.toBeUndefined();
      const wellboreIds = [
        'WDL:Wellbore:dummy102',
        'wellbore:Platform WB 12.25 in OH',
        'wellbore:Platform WB 8.5 in OH',
      ];
      wellboreIds.forEach(id => {
        expect(wellbores.map(wellbore => wellbore.externalId)).toContain(id);
      });
    });

    test('Get wellbores from multiple well ids', async () => {
      const wellIds = [2457499785650331, 2275887128760800];

      const wellbores: Wellbore[] = await client.wellbores.getFromWells(
        wellIds
      );

      expect(wellbores).not.toBeUndefined();
      const wellboreIds = [
        870793324939646,
        1072803479704457,
        8456650753594878,
        4331964628426904,
      ];
      wellboreIds.forEach(id => {
        expect(wellbores.map(wellbore => wellbore.id)).toContain(id);
      });
    });
  }
);
