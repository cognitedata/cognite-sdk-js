// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type {
  TaskDefinition,
  Version,
  Workflow,
  WorkflowExecution,
} from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const workflowTasks: TaskDefinition = {
  externalId: 'int-execution-task-1',
  type: 'function',
  parameters: {
    function: { externalId: 'int-fn-external-id' },
  },
};

describe('Workflow executions integration test', () => {
  let client: CogniteClientAlpha;
  const workflowExternalId = `int-workflow-execution-${randomInt()}`;
  const versionExternalId = '1';
  let createdWorkflow: Workflow | undefined;
  let createdVersion: Version | undefined;
  let createdExecution: WorkflowExecution | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();

    const workflowItems = await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for executions',
        maxConcurrentExecutions: 1,
      },
    ]);
    createdWorkflow = workflowItems[0];

    const versionItems = await client.workflowVersions.upsert([
      {
        workflowExternalId,
        version: versionExternalId,
        workflowDefinition: {
          description: 'integration test workflow version for executions',
          tasks: [workflowTasks],
        },
      },
    ]);
    createdVersion = versionItems[0];
  });

  afterAll(async () => {
    if (createdExecution) {
      await client.workflowExecutions
        .cancel(createdExecution.id, {
          reason: 'cleanup after integration test',
        })
        .catch();
    }

    if (createdVersion) {
      await client.workflowVersions
        .delete([
          {
            workflowExternalId,
            version: versionExternalId,
          },
        ])
        .catch();
    }

    if (createdWorkflow) {
      await client.workflows
        .delete([{ externalId: workflowExternalId }])
        .catch();
    }
  });

  test('run', async () => {
    const clientSecret = process.env.COGNITE_CLIENT_SECRET || '';
    const clientId = process.env.COGNITE_CLIENT_ID || '';
    const [session] = await client.sessions.create([
      {
        clientId,
        clientSecret,
      },
    ]);

    createdExecution = await client.workflowExecutions.run(
      workflowExternalId,
      versionExternalId,
      {
        authentication: { nonce: session.nonce },
        metadata: { source: 'sdk-int-test' },
      }
    );

    expect(createdExecution.id).toBeTruthy();
    expect(createdExecution.workflowExternalId).toBe(workflowExternalId);
    expect(createdExecution.version).toBe(versionExternalId);
    expect(createdExecution.status).toBe('RUNNING');
    expect(createdExecution.engineExecutionId).toBeTruthy();
    expect(createdExecution.createdTime).toBeTruthy();
    expect(createdExecution.metadata).toEqual({ source: 'sdk-int-test' });
  });

  test('list', async () => {
    const response = await client.workflowExecutions.list({
      filter: {
        workflowFilters: [
          {
            externalId: workflowExternalId,
            version: versionExternalId,
          },
        ],
      },
      limit: 10,
    });

    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBeGreaterThan(0);
    expect(
      response.items.some(
        (item) =>
          item.workflowExternalId === workflowExternalId &&
          item.version === versionExternalId
      )
    ).toBe(true);
  });

  test('retrieve by execution id', async () => {
    expect(createdExecution).toBeDefined();
    if (!createdExecution) {
      return;
    }

    const execution = await client.workflowExecutions.retrieve(
      createdExecution.id
    );

    expect(execution.id).toBe(createdExecution.id);
    expect(execution.workflowExternalId).toBe(workflowExternalId);
    expect(execution.version).toBe(versionExternalId);
  });

  test('cancel', async () => {
    expect(createdExecution).toBeDefined();
    if (!createdExecution) {
      return;
    }

    const execution = await client.workflowExecutions.cancel(
      createdExecution.id,
      { reason: 'integration test cancel' }
    );

    expect(execution.id).toBe(createdExecution.id);
    expect(execution.status).toBe('TERMINATED');
  });
});
