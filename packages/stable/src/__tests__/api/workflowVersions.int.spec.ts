// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { WorkflowTaskDefinition } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const workflowTask: WorkflowTaskDefinition = {
  externalId: 'int-task-1',
  type: 'function',
  parameters: {
    function: { externalId: 'int-fn-external-id' },
  },
};

describe('Workflow versions integration test', () => {
  let client: CogniteClient;
  const workflowExternalId = `int-workflow-version-${randomInt()}`;
  const version = '1';

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for versions',
        maxConcurrentExecutions: 1,
      },
    ]);
    await client.workflows.versions.upsert([
      {
        workflowExternalId,
        version,
        workflowDefinition: {
          description: 'integration test workflow version',
          tasks: [workflowTask],
        },
      },
    ]);
  });

  afterAll(async () => {
    await client.workflows.delete([{ externalId: workflowExternalId }]).catch();
  });

  test('list', async () => {
    const response = await client.workflows.versions.list({
      filter: { workflowFilters: [{ externalId: workflowExternalId }] },
      limit: 10,
    });
    expect(
      response.items.map((item) => [item.workflowExternalId, item.version])
    ).toContainEqual([workflowExternalId, version]);
  });

  test('retrieve', async () => {
    const retrieved = await client.workflows.versions.retrieve(
      workflowExternalId,
      version
    );
    expect(retrieved.workflowDefinition?.tasks).toEqual([
      expect.objectContaining({ externalId: workflowTask.externalId }),
    ]);
  });

  test('upsert updates existing workflow version', async () => {
    const items = await client.workflows.versions.upsert([
      {
        workflowExternalId,
        version,
        workflowDefinition: {
          description: 'integration test workflow version - updated',
          tasks: [workflowTask],
        },
      },
    ]);
    expect(items[0].workflowDefinition?.description).toBe(
      'integration test workflow version - updated'
    );
  });

  test('delete', async () => {
    const deleteVersion = `delete-${randomInt()}`;
    await client.workflows.versions.upsert([
      {
        workflowExternalId,
        version: deleteVersion,
        workflowDefinition: { tasks: [workflowTask] },
      },
    ]);

    await client.workflows.versions.delete([
      { workflowExternalId, version: deleteVersion },
    ]);

    const listAfterDelete = await client.workflows.versions.list({
      filter: {
        workflowFilters: [
          { externalId: workflowExternalId, version: deleteVersion },
        ],
      },
    });
    expect(listAfterDelete.items).toEqual([]);
  });
});
