// Copyright 2023 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import {
  getOrCreateDataSet,
  getOrCreateFile,
  setupLoggedInClient,
} from '../testUtils';
import {
  createTestIdentifiers,
  fileExtensionTypes,
  modelTypes,
  routineRevisionConfiguration,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator runs api', () => {
  const {
    uniqueSuffix,
    simulatorExternalId,
    modelExternalId,
    modelRevisionExternalId,
    routineExternalId,
    routineRevisionExternalId,
    simulatorIntegrationExternalId,
    simulatorName,
  } = createTestIdentifiers();
  const client: CogniteClientAlpha = setupLoggedInClient();
  let runId = 0;
  let simulatorId: number;
  let testDataSetId: number;
  let testFileId: number;

  beforeAll(async () => {
    testDataSetId = await getOrCreateDataSet(client);
    testFileId = await getOrCreateFile(client, testDataSetId);
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
        heartbeat: new Date(),
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

  test('create model revision', async () => {
    const response = await client.simulators.createModelRevisions([
      {
        externalId: modelRevisionExternalId,
        modelExternalId,
        description: 'test sim model revision description',
        fileId: testFileId,
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
    const ts = new Date();
    const res = await client.simulators.runSimulation([
      {
        routineExternalId,
        runType: 'external',
        runTime: ts,
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
    expect(item.runTime?.valueOf()).toBe(ts.valueOf());
    expect(item.createdTime.valueOf()).toBeGreaterThanOrEqual(uniqueSuffix);
    expect(item.lastUpdatedTime.valueOf()).toBeGreaterThanOrEqual(uniqueSuffix);
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
