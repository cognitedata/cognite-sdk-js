// Copyright 2023 Cognite AS

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

describeIf('simulator models api', () => {
  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}`;
  const modelExternalId = `test_sim_model_${ts}`;
  const modelRevisionExternalId = `test_sim_model_revision_${ts}`;
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
  });

  test('create model', async () => {
    const res = await client.simulators.createModels([
      {
        externalId: modelExternalId,
        simulatorExternalId,
        name: 'Test Simulator Model',
        description: 'Test Simulator Model Desc',
        dataSetId: 4097666328084896,
        labels: [{ externalId: 'air-quality-po-1' }],
        type: 'string',
        unitSystem: 'SI',
      },
    ]);
    expect(res.length).toBe(1);
    expect(res[0].externalId).toBe(modelExternalId);
  });

  test('list models', async () => {
    const list_response = await client.simulators.listModels();
    expect(list_response.items.length).toBeGreaterThan(0);
    const modelFound = list_response.items.find(
      (item) => item.externalId === modelExternalId
    );
    expect(modelFound?.externalId).toBe(modelExternalId);
  });

  test('create model revision', async () => {
    const response = await client.simulators.createModelRevisions([
      {
        externalId: modelRevisionExternalId,
        modelExternalId,
        description: 'test sim model revision description',
        fileId: 3747718694331206,
        boundaryConditions: [],
        metadata: {},
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(modelRevisionExternalId);
  });

  test('delete model', async () => {
    const response = await client.simulators.deleteModels([
      { externalId: modelExternalId },
    ]);
    expect(response).toEqual({});
    const responseAfterDelete = await client.simulators.listModels();
    expect(
      responseAfterDelete.items.filter(
        (res) => res.externalId == modelExternalId
      ).length
    ).toBe(0);
  });

  test('delete simulator and integrationns', async () => {
    // Since we do not have a delete endpoint for integrations, if we delete the simulator, the integrations will be deleted as well
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
