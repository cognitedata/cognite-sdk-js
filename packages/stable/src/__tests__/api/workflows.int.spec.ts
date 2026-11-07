// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Workflow } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Workflows integration test', () => {
  let client: CogniteClient;
  const workflowExternalId = `int-workflow-${randomInt()}`;
  let createdWorkflow: Workflow | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();
    const items = await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow',
        maxConcurrentExecutions: 2,
      },
    ]);
    createdWorkflow = items[0];
  });

  afterAll(async () => {
    if (!createdWorkflow) {
      return;
    }
    await client.workflows.delete([{ externalId: workflowExternalId }]).catch();
  });

  test('list', async () => {
    const response = await client.workflows.list({ limit: 10 });
    expect(Array.isArray(response.items)).toBe(true);
  });

  test('retrieve', async () => {
    const workflow = await client.workflows.retrieve(workflowExternalId);
    expect(workflow.externalId).toBe(workflowExternalId);
  });

  test('upsert updates existing workflow', async () => {
    const items = await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow - updated',
        maxConcurrentExecutions: 4,
      },
    ]);
    expect({
      description: items[0].description,
      maxConcurrentExecutions: items[0].maxConcurrentExecutions,
    }).toEqual({
      description: 'integration test workflow - updated',
      maxConcurrentExecutions: 4,
    });
  });

  test('delete', async () => {
    const externalId = `int-workflows-delete-${randomInt()}`;
    await client.workflows.upsert([{ externalId }]);

    await client.workflows.delete([{ externalId }]);

    await expect(
      client.workflows.delete([{ externalId }], { ignoreUnknownIds: false })
    ).rejects.toThrow();
  });
});
