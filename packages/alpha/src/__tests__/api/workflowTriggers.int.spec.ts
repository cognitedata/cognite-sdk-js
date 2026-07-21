// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type {
  TaskDefinition,
  Version,
  Workflow,
  WorkflowTrigger,
} from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

const workflowTasks: TaskDefinition = {
  externalId: 'int-trigger-task-1',
  type: 'function',
  parameters: {
    function: { externalId: 'int-fn-external-id' },
  },
};

describe('Workflow triggers integration test', () => {
  let client: CogniteClientAlpha;
  const workflowExternalId = `int-workflow-trigger-${randomInt()}`;
  const versionExternalId = '1';
  const triggerExternalId = `int-trigger-${randomInt()}`;
  let createdWorkflow: Workflow | undefined;
  let createdVersion: Version | undefined;
  let createdTrigger: WorkflowTrigger | undefined;

  const createSessionNonce = async () => {
    const clientSecret = process.env.COGNITE_CLIENT_SECRET || '';
    const clientId = process.env.COGNITE_CLIENT_ID || '';
    const [session] = await client.sessions.create([
      {
        clientId,
        clientSecret,
      },
    ]);
    return session.nonce;
  };

  beforeAll(async () => {
    client = setupLoggedInClient();

    const workflowItems = await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for triggers',
        maxConcurrentExecutions: 1,
      },
    ]);
    createdWorkflow = workflowItems[0];

    const versionItems = await client.workflowVersions.upsert([
      {
        workflowExternalId,
        version: versionExternalId,
        workflowDefinition: {
          description: 'integration test workflow version for triggers',
          tasks: [workflowTasks],
        },
      },
    ]);
    createdVersion = versionItems[0];

    const [trigger] = await client.workflowTriggers.upsert([
      {
        externalId: triggerExternalId,
        triggerRule: {
          triggerType: 'schedule',
          cronExpression: '0 0 1 1 *',
          timezone: 'UTC',
        },
        workflowExternalId,
        workflowVersion: versionExternalId,
        authentication: { nonce: await createSessionNonce() },
        metadata: { source: 'sdk-int-test' },
      },
    ]);
    createdTrigger = trigger;
  });

  afterAll(async () => {
    try {
      if (createdTrigger) {
        await client.workflowTriggers
          .delete([{ externalId: triggerExternalId }])
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
    } catch (error) {
      console.error(
        'Workflow triggers integration test cleanup failed:',
        error
      );
    }
  });

  test('list', async () => {
    const items = await client.workflowTriggers
      .list({ limit: 100 })
      .autoPagingToArray({ limit: 100 });

    expect(Array.isArray(items)).toBe(true);
    expect(items).toContainEqual(
      expect.objectContaining({
        externalId: triggerExternalId,
        workflowExternalId,
        workflowVersion: versionExternalId,
      })
    );
  });

  test('upsert updates existing trigger', async () => {
    const [trigger] = await client.workflowTriggers.upsert([
      {
        externalId: triggerExternalId,
        triggerRule: {
          triggerType: 'schedule',
          cronExpression: '0 0 1 1 *',
          timezone: 'UTC',
        },
        workflowExternalId,
        workflowVersion: versionExternalId,
        authentication: { nonce: await createSessionNonce() },
        metadata: { source: 'sdk-int-test-updated' },
      },
    ]);
    createdTrigger = trigger;

    expect(trigger.externalId).toBe(triggerExternalId);
    expect(trigger.workflowExternalId).toBe(workflowExternalId);
    expect(trigger.workflowVersion).toBe(versionExternalId);
    expect(trigger.metadata).toEqual({ source: 'sdk-int-test-updated' });
  });

  test('pause and resume', async () => {
    await expect(
      client.workflowTriggers.pause(triggerExternalId)
    ).resolves.toBe(undefined);
    await expect(
      client.workflowTriggers.resume(triggerExternalId)
    ).resolves.toBe(undefined);
  });

  test('history', async () => {
    const response = await client.workflowTriggers.history(triggerExternalId, {
      limit: 10,
    });

    expect(Array.isArray(response.items)).toBe(true);
  });

  test('delete', async () => {
    const deleteTriggerExternalId = `int-trigger-delete-${randomInt()}`;
    const [triggerToDelete] = await client.workflowTriggers.upsert([
      {
        externalId: deleteTriggerExternalId,
        triggerRule: {
          triggerType: 'schedule',
          cronExpression: '0 0 1 1 *',
          timezone: 'UTC',
        },
        workflowExternalId,
        workflowVersion: versionExternalId,
        authentication: { nonce: await createSessionNonce() },
      },
    ]);

    expect(triggerToDelete.externalId).toBe(deleteTriggerExternalId);

    await expect(
      client.workflowTriggers.delete([{ externalId: deleteTriggerExternalId }])
    ).resolves.toBeDefined();
  });
});
