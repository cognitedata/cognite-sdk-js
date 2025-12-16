// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { SimulatorRoutineRevision } from '../../types';
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
  routineRevisionScript,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator routines api', () => {
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
  let simulatorId: number;
  let testDataSetId: number;
  let testFileId: number;
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

  test('create or retrieve file', async () => {
    testFileId = await getOrCreateFile(client, testDataSetId);

    expect(testFileId).toBeGreaterThan(0);
    expect(testFileId).toBeTypeOf('number');
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
