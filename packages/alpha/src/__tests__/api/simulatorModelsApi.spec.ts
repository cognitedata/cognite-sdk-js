// Copyright 2023 Cognite AS

import { describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import {
  fileExtensionTypes,
  modelTypes,
  stepFields,
  unitQuantities,
} from './seed';

describe('simulator models api', () => {
  const ts = Date.now();
  const simulatorExternalId = `test_sim_${ts}_b`;
  const modelExternalId = `test_sim_model_${ts}`;
  const modelRevisionExternalId = `test_sim_model_revision_${ts}`;
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

  test('aggregate models', async () => {
    const aggregateResponse = await client.simulators.aggregateModels({
      filter: {
        simulatorExternalIds: [simulatorExternalId],
        externalIdPrefix: 'test',
      },
      aggregate: 'count',
    });

    expect(aggregateResponse[0].count).toBeGreaterThan(0);
  });

  test('list models', async () => {
    const list_response = await client.simulators.listModels();
    expect(list_response.items.length).toBeGreaterThan(0);
    const modelFound = list_response.items.find(
      (item) => item.externalId === modelExternalId
    );
    expect(modelFound?.externalId).toBe(modelExternalId);
  });

  test('list models with externalIdPrefix', async () => {
    const prefixSearch = 'test';
    const listResponse = await client.simulators.listModels({
      filter: {
        externalIdPrefix: prefixSearch,
      },
    });

    expect(listResponse.items.length).toBeGreaterThan(0);
    const startsWithPrefix =
      listResponse.items[0].externalId.startsWith(prefixSearch);
    expect(startsWithPrefix).toBe(true);
  });

  test('retrieve model by id', async () => {
    const retrieve_response = await client.simulators.retrieveModels([
      { externalId: modelExternalId },
    ]);
    expect(retrieve_response.length).toBeGreaterThan(0);
    const modelFound = retrieve_response.find(
      (item) => item.externalId === modelExternalId
    );
    expect(modelFound?.externalId).toBe(modelExternalId);
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

  test('create model revision and list with versions filter', async () => {
    const revisionExternalId = `${modelRevisionExternalId}_2`;
    const response = await client.simulators.createModelRevisions([
      {
        externalId: revisionExternalId,
        modelExternalId,
        description: 'test sim model revision description',
        fileId: fileId,
      },
    ]);
    expect(response.length).toBe(1);
    expect(response[0].externalId).toBe(revisionExternalId);

    const listModelRevisions = await client.simulators.listModelRevisions({
      filter: {
        modelExternalIds: [modelExternalId],
        allVersions: true,
      },
    });

    const revisionFilter = listModelRevisions.items.filter(
      (item) => item.modelExternalId === modelExternalId
    );
    expect(revisionFilter.length).toBe(2);
  });

  test('retrieve model revision by id', async () => {
    const retrieve_response = await client.simulators.retrieveModelRevisions([
      { externalId: modelRevisionExternalId },
    ]);
    expect(retrieve_response.length).toBeGreaterThan(0);
    const modelRevisionFound = retrieve_response.find(
      (item) => item.externalId === modelRevisionExternalId
    );
    expect(modelRevisionFound?.externalId).toBe(modelRevisionExternalId);
  });

  test('delete model', async () => {
    const response = await client.simulators.deleteModels([
      { externalId: modelExternalId },
    ]);
    expect(response).toEqual({});
    const responseAfterDelete = await client.simulators.listModels();
    expect(
      responseAfterDelete.items.filter(
        (res) => res.externalId === modelExternalId
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
          (res) => res.externalId === simulatorExternalId
        ).length
      ).toBe(0);
    }
  });
});
