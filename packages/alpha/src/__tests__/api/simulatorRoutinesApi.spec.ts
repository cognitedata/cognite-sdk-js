// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { SimulatorRoutineRevision } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  modelTypes,
  routineRevisionConfiguration,
  routineRevisionScript,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator routines api', () => {
  const ts = randomInt();
  const simulatorExternalId = `test_sim_${ts}_c`;
  const modelExternalId = `test_sim_model_${ts}_2`;
  const modelRevisionExternalId = `test_sim_model_revision_${ts}_2_1`;
  const routineExternalId = `test_sim_routine_${ts}`;
  const routineRevisionExternalId = `test_sim_routine_revision_${ts}`;
  const simulatorIntegrationExternalId = `test_sim_integration_${ts}_2`;
  const simulatorName = `TestSim - ${ts}`;
  const client: CogniteClientAlpha = setupLoggedInClient();
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
        directoryPrefix: '/test',
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

  test('list routines with all filters combined', async () => {
    const listFilterResponse = await client.simulators.listRoutines({
      filter: {
        simulatorExternalIds: [simulatorExternalId],
        simulatorIntegrationExternalIds: [simulatorIntegrationExternalId],
        modelExternalIds: [modelExternalId],
      },
    });
    expect(listFilterResponse.items.length).toBeGreaterThan(0);
    const routineFound = listFilterResponse.items.find(
      (item) => item.externalId === routineExternalId
    );
    expect(routineFound?.externalId).toBe(routineExternalId);
  });

  test('aggregate routines', async () => {
    const aggregateResponse = await client.simulators.aggregateRoutines({
      filter: {
        simulatorExternalIds: [simulatorExternalId],
      },
      aggregate: 'count',
    });
    expect(aggregateResponse[0].count).toBeGreaterThan(0);
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
    const listResponse = await client.simulators.listRoutineRevisions({
      sort: [
        {
          property: 'createdTime',
          order: 'desc',
        },
      ],
    });
    expect(listResponse.items.length).toBeGreaterThan(0);
    const routineRevisionFound = listResponse.items.filter(
      (item) => item.routineExternalId === routineExternalId
    );
    expect(routineRevisionFound.length).toBe(1);
    expect(routineRevisionFound[0].externalId).toBe(
      `${routineRevisionExternalId}_2`
    );
  });

  test('list routine revision include all fields', async () => {
    const listResponse = await client.simulators
      .listRoutineRevisions<SimulatorRoutineRevision>({
        filter: { allVersions: true },
        includeAllFields: true,
        sort: [
          {
            property: 'createdTime',
            order: 'desc',
          },
        ],
      })
      .autoPagingToArray();
    expect(listResponse.length).toBeGreaterThan(0);
    const routineRevisionFound = listResponse.find(
      (item) => item.externalId === routineRevisionExternalId
    );
    expect(routineRevisionFound).toBeDefined();
    expect(routineRevisionFound?.script).toEqual(routineRevisionScript);
    expect(routineRevisionFound?.configuration).toEqual(
      routineRevisionConfiguration
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
          (res) => res.externalId === simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});
