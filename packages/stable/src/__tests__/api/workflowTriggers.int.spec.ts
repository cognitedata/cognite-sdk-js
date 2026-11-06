// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { WorkflowTriggerUpsert } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Workflow triggers integration test', () => {
  let client: CogniteClient;
  const workflowExternalId = `int-workflow-trigger-${randomInt()}`;
  const workflowVersion = '1';
  const triggerExternalId = `int-trigger-${randomInt()}`;

  const createNonce = async () => {
    const [session] = await client.sessions.create([
      {
        clientId: process.env.COGNITE_CLIENT_ID || '',
        clientSecret: process.env.COGNITE_CLIENT_SECRET || '',
      },
    ]);
    return session.nonce;
  };

  const scheduleTrigger = async (
    externalId: string,
    metadata?: Record<string, string>
  ): Promise<WorkflowTriggerUpsert> => ({
    externalId,
    triggerRule: {
      triggerType: 'schedule',
      cronExpression: '0 0 1 1 *',
      timezone: 'UTC',
    },
    workflowExternalId,
    workflowVersion,
    metadata,
    authentication: { nonce: await createNonce() },
  });

  beforeAll(async () => {
    client = setupLoggedInClient();
    await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for triggers',
        maxConcurrentExecutions: 1,
      },
    ]);
    await client.workflows.versions.upsert([
      {
        workflowExternalId,
        version: workflowVersion,
        workflowDefinition: {
          tasks: [
            {
              externalId: 'int-trigger-task-1',
              type: 'function',
              parameters: { function: { externalId: 'int-fn-external-id' } },
            },
          ],
        },
      },
    ]);
    await client.workflows.triggers.upsert([
      await scheduleTrigger(triggerExternalId, { source: 'sdk-int-test' }),
    ]);
  });

  afterAll(async () => {
    await client.workflows.triggers
      .delete([{ externalId: triggerExternalId }])
      .catch();
    await client.workflows.delete([{ externalId: workflowExternalId }]).catch();
  });

  test('list', async () => {
    const items = await client.workflows.triggers
      .list()
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });
    expect(items.map((item) => item.externalId)).toContain(triggerExternalId);
  });

  test('upsert updates existing trigger', async () => {
    const [trigger] = await client.workflows.triggers.upsert([
      await scheduleTrigger(triggerExternalId, {
        source: 'sdk-int-test-updated',
      }),
    ]);
    expect(trigger.metadata).toEqual({ source: 'sdk-int-test-updated' });
  });

  test('pause and resume', async () => {
    await client.workflows.triggers.pause(triggerExternalId);
    await client.workflows.triggers.resume(triggerExternalId);
    const items = await client.workflows.triggers
      .list()
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });
    expect(
      items.find((item) => item.externalId === triggerExternalId)?.isPaused
    ).toBe(false);
  });

  test('listRuns', async () => {
    const response = await client.workflows.triggers.listRuns(
      triggerExternalId,
      { limit: 10 }
    );
    expect(Array.isArray(response.items)).toBe(true);
  });

  test('delete', async () => {
    const deleteExternalId = `int-trigger-delete-${randomInt()}`;
    await client.workflows.triggers.upsert([
      await scheduleTrigger(deleteExternalId),
    ]);

    await client.workflows.triggers.delete([{ externalId: deleteExternalId }]);

    const items = await client.workflows.triggers
      .list()
      .autoPagingToArray({ limit: Number.POSITIVE_INFINITY });
    expect(items.map((item) => item.externalId)).not.toContain(
      deleteExternalId
    );
  });
});
