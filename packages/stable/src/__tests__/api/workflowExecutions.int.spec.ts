// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { WorkflowExecution, WorkflowTaskDefinition } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const workflowTask: WorkflowTaskDefinition = {
  externalId: 'int-execution-task-1',
  type: 'function',
  parameters: {
    function: { externalId: 'int-fn-external-id' },
  },
};

describe('Workflow executions integration test', () => {
  let client: CogniteClient;
  const workflowExternalId = `int-workflow-execution-${randomInt()}`;
  const version = '1';
  let createdExecution: WorkflowExecution | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for executions',
        maxConcurrentExecutions: 1,
      },
    ]);
    await client.workflows.versions.upsert([
      {
        workflowExternalId,
        version,
        workflowDefinition: {
          description: 'integration test workflow version for executions',
          tasks: [workflowTask],
        },
      },
    ]);
  });

  afterAll(async () => {
    if (createdExecution?.status === 'RUNNING') {
      await client.workflows.executions
        .cancel(createdExecution.id, {
          reason: 'cleanup after integration test',
        })
        .catch();
    }
    await client.workflows.delete([{ externalId: workflowExternalId }]).catch();
  });

  test('run', async () => {
    const [session] = await client.sessions.create([
      {
        clientId: process.env.COGNITE_CLIENT_ID || '',
        clientSecret: process.env.COGNITE_CLIENT_SECRET || '',
      },
    ]);

    createdExecution = await client.workflows.executions.run(
      workflowExternalId,
      version,
      {
        authentication: { nonce: session.nonce },
        metadata: { source: 'sdk-int-test' },
      }
    );

    expect(createdExecution).toMatchObject({
      workflowExternalId,
      version,
      status: 'RUNNING',
      metadata: { source: 'sdk-int-test' },
    });
  });

  test('list', async () => {
    const response = await client.workflows.executions.list({
      filter: {
        workflowFilters: [{ externalId: workflowExternalId, version }],
      },
      limit: 10,
    });
    expect(response.items.map((item) => item.id)).toContain(
      createdExecution?.id
    );
  });

  test('retrieve', async () => {
    if (!createdExecution) {
      throw new Error('run did not create an execution');
    }
    const execution = await client.workflows.executions.retrieve(
      createdExecution.id
    );
    expect(execution).toMatchObject({
      id: createdExecution.id,
      workflowExternalId,
      version,
      workflowDefinition: {
        tasks: [
          expect.objectContaining({ externalId: workflowTask.externalId }),
        ],
      },
    });
  });

  test('cancel', async () => {
    if (!createdExecution) {
      throw new Error('run did not create an execution');
    }
    createdExecution = await client.workflows.executions.cancel(
      createdExecution.id,
      { reason: 'integration test cancel' }
    );
    expect(createdExecution.status).toBe('TERMINATED');
  });
});
