// Copyright 2023 Cognite AS

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

describeIf('simulator integrations api', () => {
  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}_a`;
  const simulatorIntegrationExternalId = `test_sim_integration_${ts}`;
  const simulatorName = `TestSim - ${ts}`;
  const client: CogniteClientAlpha = setupLoggedInClient();
  let simulatorId: number;

  test('create simulator', async () => {
    const response = await client.simulators.create([
      {
        externalId: simulatorExternalId,
        name: simulatorName,
        fileExtensionTypes,
        enabled: true,
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
        heartbeat: new Date(ts),
        dataSetId: 4097666328084896,
        connectorVersion: '1.0.0',
        simulatorVersion: '1.0.0',
        runApiEnabled: true,
        licenseStatus: 'active',
        licenseLastCheckedTime: new Date(),
        connectorStatus: 'unknown',
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
          (res) => res.externalId == simulatorExternalId
        ).length
      ).toBe(0);

      const responseAfterSimulatorDelete =
        await client.simulators.listIntegrations();
      expect(
        responseAfterSimulatorDelete.items.filter(
          (res) => res.externalId == simulatorIntegrationExternalId
        ).length
      ).toBe(0);
    }
  });
});
