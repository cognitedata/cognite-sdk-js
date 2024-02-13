// Copyright 2023 Cognite AS

import { SimulatorPatch } from '../../types';
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  stepFields,
  unitsMap,
  unitSystem,
  modelTypes,
  boundaryConditions,
} from './mocks';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulator integrations api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}`;
  const simulatorName = `TestSim - ${ts}`;
  let simulatorId: number;

  test('create simulators', async () => {
    const response = await client.simulators.create([
      {
        externalId: simulatorExternalId,
        name: simulatorName,
        fileExtensionTypes,
        enabled: true,
        stepFields,
        units: {
          unitsMap,
          unitSystem,
        },
        modelTypes,
        boundaryConditions,
        isCalculationsEnabled: true,
      },
    ]);
    simulatorId = response[0].id;
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(simulatorExternalId);
    expect(response[0].fileExtensionTypes).toEqual(['csv', 'yaml']);
    expect(response[0].enabled).toBe(true);
    // expect(response[0].stepFields).toEqual(stepFields);
    // expect(response[0].units).toEqual({
    //   unitsMap,
    //   unitSystem
    // });
    expect(response[0].modelTypes).toEqual(modelTypes);
    expect(response[0].boundaryConditions).toEqual(boundaryConditions);
    expect(response[0].isCalculationsEnabled).toBe(true);
    expect(response[0].isBoundaryConditionsEnabled).toBe(false);
  });

  test('update simulators', async () => {
    const patch: SimulatorPatch['update'] = {
      isBoundaryConditionsEnabled: {
        set: true,
      },
      fileExtensionTypes: {
        set: ['py'],
      },
      boundaryConditions: {
        set: [
          {
            name: 'test_update',
            address: 'a.b.c',
            key: 'test_update',
          },
        ],
      },
      modelTypes: {
        set: [
          {
            key: 'test_update',
            name: 'test_update',
          },
        ],
      },
      units: {
        set: {
          unitsMap: {
            activityUpdated: {
              label: 'Activity',
              units: [
                {
                  label: 'activity',
                  value: 'activity',
                },
              ],
            },
          },
          unitSystem: {},
        },
      },
      stepFields: {
        set: [
          {
            fields: [
              {
                info: 'test_update',
                label: 'test_update',
                name: 'test_update',
                options: null,
              },
            ],
            stepType: 'get/set-updated',
          },
        ],
      },
    };
    const response = await client.simulators.update([
      {
        id: simulatorId,
        update: patch,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].isBoundaryConditionsEnabled).toBe(true);
    expect(response[0].fileExtensionTypes).toEqual(
      (patch.fileExtensionTypes as any).set
    );
    expect(response[0].boundaryConditions).toEqual(
      (patch.boundaryConditions as any).set
    );
    expect(response[0].modelTypes).toEqual((patch.modelTypes as any).set);
    expect(response[0].units).toEqual((patch.units as any).set);
    expect(response[0].stepFields).toEqual((patch.stepFields as any).set);
  });

  test('list simulators', async () => {
    const response = await client.simulators.list({
      filter: { enabled: true },
    });
    expect(response.items.length).toBeGreaterThan(0);
    const simulatorFound = response.items.find(
      (item) => item.externalId === simulatorExternalId
    );
    expect(simulatorFound?.externalId).toBe(simulatorExternalId);
  });

  test('delete simulators', async () => {
    if (simulatorId) {
      const response = await client.simulators.delete([
        {
          id: simulatorId,
        },
      ]);
      expect(response).toEqual({});
      const responseAfterDelete = await client.simulators.list();
      expect(
        responseAfterDelete.items.filter(
          (res) => res.externalId == simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});
