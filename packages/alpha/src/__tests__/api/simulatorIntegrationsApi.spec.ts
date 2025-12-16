// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import {
  createTestIdentifiers,
  getOrCreateDataSet,
  setupLoggedInClient,
} from '../testUtils';
import {
  fileExtensionTypes,
  modelTypes,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator integrations api', () => {
  const {
    uniqueSuffix,
    simulatorExternalId,
    simulatorIntegrationExternalId,
    simulatorName,
  } = createTestIdentifiers();
  const client: CogniteClientAlpha = setupLoggedInClient();
  let simulatorId: number;
  let testDataSetId: number;
  test('create or retrieve dataset', async () => {
    testDataSetId = await getOrCreateDataSet(client);

    expect(testDataSetId).toBeGreaterThan(0);
    expect(testDataSetId).toBeTypeOf('number');
  });

  test('create simulator', async () => {
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
  });

  test('create integration', async () => {
    const response = await client.simulators.createIntegrations([
      {
        externalId: simulatorIntegrationExternalId,
        simulatorExternalId: simulatorExternalId,
        heartbeat: new Date(uniqueSuffix),
        dataSetId: testDataSetId,
        connectorVersion: '1.0.0',
        simulatorVersion: '1.0.0',
        licenseStatus: 'UNKNOWN',
        licenseLastCheckedTime: new Date(),
        connectorStatus: 'IDLE',
        connectorStatusUpdatedTime: new Date(),
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(simulatorIntegrationExternalId);
  });

  test('list integrations', async () => {
    const list_response = await client.simulators.listIntegrations();
    expect(list_response.items.length).toBeGreaterThan(0);
    const integrationFound = list_response.items.find(
      (item) => item.externalId === simulatorIntegrationExternalId
    );
    expect(integrationFound?.externalId).toBe(simulatorIntegrationExternalId);
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

      const responseAfterSimulatorDelete =
        await client.simulators.listIntegrations();
      expect(
        responseAfterSimulatorDelete.items.filter(
          (res) => res.externalId === simulatorIntegrationExternalId
        ).length
      ).toBe(0);
    }
  });
});
