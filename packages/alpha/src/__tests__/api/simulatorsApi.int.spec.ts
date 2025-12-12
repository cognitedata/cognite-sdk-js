// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { SimulatorPatch } from '../../types';
import { setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  modelTypes,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulators api', () => {
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
    expect(response[0].fileExtensionTypes).toEqual(['csv', 'yaml', 'dwxmz']);
    expect(response[0].stepFields).toEqual(stepFields);
    expect(response[0].unitQuantities).toEqual(unitQuantities);
    expect(response[0].modelTypes).toEqual(modelTypes);
  });

  test('update simulators', async () => {
    const fileExtensionTypes = {
      set: ['py'],
    };
    const modelTypes = {
      set: [
        {
          key: 'test_update',
          name: 'test_update',
        },
      ],
    };
    const unitQuantities = {
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
    };
    const stepFields = {
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
    };
    const patch: SimulatorPatch['update'] = {
      fileExtensionTypes,
      modelTypes,
      unitQuantities,
      stepFields,
    };
    const response = await client.simulators.update([
      {
        id: simulatorId,
        update: patch,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].fileExtensionTypes).toEqual(fileExtensionTypes.set);
    expect(response[0].modelTypes).toEqual(modelTypes.set);
    expect(response[0].unitQuantities).toEqual(unitQuantities.set);
    expect(response[0].stepFields).toEqual(stepFields.set);
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
          (res) => res.externalId === simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});
