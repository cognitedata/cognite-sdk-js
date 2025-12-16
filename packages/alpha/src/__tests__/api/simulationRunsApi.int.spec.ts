// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import { randomInt, setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  modelTypes,
  routineRevisionConfiguration,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator runs api', () => {
  const ts = randomInt();
  const simulatorExternalId = `test_sim_${ts}_c`;
  const modelExternalId = `test_sim_model_${ts}_2`;
  const modelRevisionExternalId = `test_sim_model_revision_${ts}_2_1`;
  const routineExternalId = `test_sim_routine_${ts}`;
  const routineRevisionExternalId = `test_sim_routine_revision_${ts}_b`;
  const simulatorIntegrationExternalId = `test_sim_integration_${ts}_2`;
  const simulatorName = `TestSim - ${ts}`;
  const client: CogniteClientAlpha = setupLoggedInClient();
  let runId = 0;
  let simulatorId: number;
  let testDataSetId: number;
  let fileId: number;
  test('create dataset', async () => {
    const datasetExternalId = 'groups-integration-test-data-set';
    const datasets = await client.datasets.retrieve(
      [{ externalId: datasetExternalId }],
      { ignoreUnknownIds: true }
    );
    if (datasets.length === 0) {
      const [dataset] = await client.datasets.create([
        {
          externalId: datasetExternalId,
          name: 'Groups integration test data set',
        },
      ]);
      testDataSetId = dataset.id;
    } else {
      testDataSetId = datasets[0].id;
    }

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
        heartbeat: new Date(ts),
        dataSetId: testDataSetId,
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
        dataSetId: testDataSetId,
        type: 'WaterWell',
      },
    ]);
    expect(res.length).toBe(1);
    expect(res[0].externalId).toBe(modelExternalId);
  });

  test('create file', async () => {
    const resp = await client.files.list({
      filter: {
        dataSetIds: [{ id: testDataSetId }],
      },
    });

    if (resp.items.length === 0) {
      const fileInfo = await client.files.upload(
        {
          externalId: `test_file_for_model_revision_${ts}.yaml`,
          name: `test_file_for_model_revision_${ts}.yaml`,
          dataSetId: testDataSetId,
        },
        'This is the content of the Cognite JS SDK Annotations API test file'
      );
      fileId = fileInfo.id;
    } else {
      fileId = resp.items[0].id;
    }

    expect(fileId).toBeGreaterThan(0);
    expect(fileId).toBeTypeOf('number');
  });

  test('create model revision', async () => {
    const response = await client.simulators.createModelRevisions([
      {
        externalId: modelRevisionExternalId,
        modelExternalId,
        description: 'test sim model revision description',
        fileId: fileId,
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
        script: [],
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(routineRevisionExternalId);
    expect(response[0].simulatorIntegrationExternalId).toBe(
      simulatorIntegrationExternalId
    );
  });

  test('run a simulation', async () => {
    const res = await client.simulators.runSimulation([
      {
        routineExternalId,
        runType: 'external',
        runTime: new Date(ts),
        queue: true,
      },
    ]);
    runId = res[0].id;
    expect(runId).toBeGreaterThan(0);

    expect(res).toBeDefined();
    expect(res.length).toBe(1);

    const item = res[0];

    expect(item.simulatorExternalId).toBe(simulatorExternalId);
    expect(item.modelExternalId).toBe(modelExternalId);
    expect(item.routineExternalId).toBe(routineExternalId);
    expect(['ready', 'running']).toContain(item.status);
    expect(item.runType).toBe('external');
    expect(item.runTime?.valueOf()).toBe(ts);
    expect(item.createdTime.valueOf()).toBeGreaterThanOrEqual(ts);
    expect(item.lastUpdatedTime.valueOf()).toBeGreaterThanOrEqual(ts);
  });

  test('list simulation runs', async () => {
    const res = await client.simulators.listRuns({
      filter: {
        simulatorExternalIds: [simulatorExternalId],
        createdTime: {
          max: new Date(),
        },
      },
      sort: [
        {
          property: 'createdTime',
          order: 'desc',
        },
      ],
    });

    expect(res).toBeDefined();
    expect(res.items.length).toBeGreaterThan(0);

    const item = res.items[0];

    expect(item.simulatorExternalId).toBe(simulatorExternalId);
    expect(item.status).toBe('ready');
    expect(item.createdTime.valueOf()).toBeGreaterThan(0);
    expect(item.lastUpdatedTime.valueOf()).toBeGreaterThan(0);
  });

  test('retrieve simulation run by id', async () => {
    expect(runId).toBeGreaterThan(0);

    const res = await client.simulators.retrieveRuns([runId]);

    expect(res).toBeDefined();
    expect(res.length).toBe(1);

    const item = res[0];

    expect(item.simulatorExternalId).toBe(simulatorExternalId);
    expect(['ready', 'running', 'success']).toContain(item.status);
    expect(item.id).toBe(runId);
  });

  test('list simulation run data', async () => {
    const runs = await client.simulators.listRuns({
      filter: {
        simulatorExternalIds: [simulatorExternalId],
        status: 'ready',
      },
    });

    const runId = runs.items[0].id;

    const runData = await client.simulators.listRunData([
      {
        runId,
      },
    ]);

    expect(runData).toBeDefined();
    expect(runData.length).toBeGreaterThan(0);

    const item = runData[0];

    expect(item.runId).toBe(runId);
  });

  test('delete simulator and integrations', async () => {
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
          (res) => res.externalId === simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});
