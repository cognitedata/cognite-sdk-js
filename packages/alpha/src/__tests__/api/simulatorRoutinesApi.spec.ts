// Copyright 2023 Cognite AS

import CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  stepFields,
  modelTypes,
  routineRevisionConfiguration,
  unitQuantities,
  routineRevisionScript,
} from './seed';

const SHOULD_RUN_TESTS = process.env.RUN_SDK_SIMINT_TESTS == 'true';

const describeIf = SHOULD_RUN_TESTS ? describe : describe.skip;

describeIf('simulator routines api', () => {
  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}_c`;
  const modelExternalId = `test_sim_model_${ts}_2`;
  const modelRevisionExternalId = `test_sim_model_revision_${ts}_2_1`;
  const routineExternalId = `test_sim_routine_${ts}`;
  const routineRevisionExternalId = `test_sim_routine_revision_${ts}`;
  const simulatorIntegrationExternalId = `test_sim_integration_${ts}_2`;
  const simulatorName = `TestSim - ${ts}`;
  const client: CogniteClientAlpha = setupLoggedInClient();
  let simulatorId: number;

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
        heartbeat: new Date(ts),
        dataSetId: 97552494921583,
        connectorVersion: '1.0.0',
        simulatorVersion: '1.0.0',
        licenseStatus: 'UNKNOWN',
        connectorStatus: 'IDLE',
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(simulatorIntegrationExternalId);
  });

  test('create model', async () => {
    const res = await client.simulators.createModels([
      {
        externalId: modelExternalId,
        simulatorExternalId,
        name: 'Test Simulator Model',
        description: 'Test Simulator Model Desc',
        dataSetId: 97552494921583,
        labels: [{ externalId: 'air-quality-po-1' }],
        type: 'WaterWell',
      },
    ]);
    expect(res.length).toBe(1);
    expect(res[0].externalId).toBe(modelExternalId);
  });

  test('create model revision', async () => {
    const response = await client.simulators.createModelRevisions([
      {
        externalId: modelRevisionExternalId,
        modelExternalId,
        description: 'test sim model revision description',
        fileId: 6396395402204465,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(modelRevisionExternalId);
  });

  test('create routine', async () => {
    const response = await client.simulators.createRoutines([
      {
        externalId: routineExternalId,
        modelExternalId,
        simulatorIntegrationExternalId,
        name: 'Test Routine',
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(routineExternalId);
  });

  test('list routines', async () => {
    const listResponse = await client.simulators.listRoutines();
    expect(listResponse.items.length).toBeGreaterThan(0);
    const routineFound = listResponse.items.find(
      (item) => item.externalId === routineExternalId
    );
    expect(routineFound?.externalId).toBe(routineExternalId);
  });

  test('create routine revision', async () => {
    const response = await client.simulators.createRoutineRevisions([
      {
        externalId: routineRevisionExternalId,
        routineExternalId,
        configuration: routineRevisionConfiguration,
        script: routineRevisionScript,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(routineRevisionExternalId);
    expect(response[0].simulatorIntegrationExternalId).toBe(
      simulatorIntegrationExternalId
    );
  });

  test('create routine revision', async () => {
    const revisionExternalId = `${routineRevisionExternalId}_2`;
    const response = await client.simulators.createRoutineRevisions([
      {
        externalId: revisionExternalId,
        routineExternalId,
        configuration: routineRevisionConfiguration,
        script: [],
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(revisionExternalId);
    expect(response[0].simulatorIntegrationExternalId).toBe(
      simulatorIntegrationExternalId
    );

    const listRoutineRevisions = await client.simulators.listRoutineRevisions({
      filter: {
        routineExternalIds: [routineExternalId],
        allVersions: false,
      },
    });

    const revisionFilter = listRoutineRevisions.items.filter(
      (item) => item.routineExternalId === routineExternalId
    );

    expect(revisionFilter.length).toBe(1);
  });

  test('list routine revision', async () => {
    const listResponse = await client.simulators.listRoutineRevisions();
    expect(listResponse.items.length).toBeGreaterThan(0);
    const routineRevisionFound = listResponse.items.find(
      (item) => item.externalId === routineRevisionExternalId
    );
    expect(routineRevisionFound?.externalId).toBe(routineRevisionExternalId);
  });

  test('list routine revision w filters', async () => {
    const listFilterResponse = await client.simulators.listRoutineRevisions({
      filter: { routineExternalIds: [routineExternalId], allVersions: true },
    });
    expect(listFilterResponse.items.length).toBe(2);
    const routineRevisionFound = listFilterResponse.items.find(
      (item) => item.externalId === routineRevisionExternalId
    );
    expect(routineRevisionFound?.externalId).toBe(routineRevisionExternalId);
  });

  test('retrieve routine revision by id', async () => {
    const retrieveResponse = await client.simulators.retrieveRoutineRevisions([
      { externalId: routineRevisionExternalId },
    ]);
    expect(retrieveResponse.length).toBeGreaterThan(0);
    const routineRevisionFound = retrieveResponse.find(
      (item) => item.externalId === routineRevisionExternalId
    );
    expect(routineRevisionFound?.externalId).toBe(routineRevisionExternalId);
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
