// Copyright 2023 Cognite AS

import { SimulatorPatch } from '../../types';
import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  stepFields,
  modelTypes,
  unitQuantities,
} from './seed';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulators api', () => {
  const client: CogniteClientAlpha = setupLoggedInClient();

  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}_d`;
  const simulatorName = `TestSim - ${ts}`;
  let simulatorId: number;

  test('create simulators', async () => {
    const response = await client.simulators.create([
      {
        externalId: simulatorExternalId,
        name: simulatorName,
        fileExtensionTypes,
        stepFields,
        unitQuantities,
        modelTypes,
      },
    ]);
    simulatorId = response[0].id;
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(simulatorExternalId);
    expect(response[0].fileExtensionTypes).toEqual(['csv', 'yaml']);
    expect(response[0].stepFields).toEqual(stepFields);
    expect(response[0].unitQuantities).toEqual(unitQuantities);
    expect(response[0].modelTypes).toEqual(modelTypes);
  });

  test('update simulators', async () => {
    const patch: SimulatorPatch['update'] = {
      fileExtensionTypes: {
        set: ['py'],
      },
      modelTypes: {
        set: [
          {
            key: 'test_update',
            name: 'test_update',
          },
        ],
      },
      unitQuantities: {
        set: [
          {
            name: 'test_update',
            label: 'test_update',
            units: [
              {
                label: 'test_update',
                name: 'test_update',
              },
            ],
          },
        ],
      },
      stepFields: {
        set: [
          {
            fields: [
              {
                info: 'test_update',
                label: 'test_update',
                name: 'test_update',
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
    expect(response[0].fileExtensionTypes).toEqual(
      (patch.fileExtensionTypes as any).set
    );
    expect(response[0].modelTypes).toEqual((patch.modelTypes as any).set);
    expect(response[0].unitQuantities).toEqual(
      (patch.unitQuantities as any).set
    );
    expect(response[0].stepFields).toEqual((patch.stepFields as any).set);
  });

  test('list simulators', async () => {
    const response = await client.simulators.list({});
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
