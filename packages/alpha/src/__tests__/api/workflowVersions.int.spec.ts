// Copyright 2026 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClientAlpha from '../../cogniteClient';
import type { Version, Workflow } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Workflow versions integration test', () => {
  let client: CogniteClientAlpha;
  const workflowExternalId = `int-workflow-version-${randomInt()}`;
  const versionExternalId = '1';
  let createdWorkflow: Workflow | undefined;
  let createdVersion: Version | undefined;

  beforeAll(async () => {
    client = setupLoggedInClient();

    const workflowItems = await client.workflows.upsert([
      {
        externalId: workflowExternalId,
        description: 'integration test workflow for versions',
        maxConcurrentExecutions: 1,
      },
    ]);
    createdWorkflow = workflowItems[0];

    const versionItems = await client.workflowVersions.upsert([
      {
        workflowExternalId,
        version: versionExternalId,
        workflowDefinition: {
          description: 'integration test workflow version',
          tasks: [],
        },
      },
    ]);
    createdVersion = versionItems[0];
  });

  afterAll(async () => {
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

  test('list', async () => {
    const response = await client.workflowVersions.list({
      filter: {
        workflowFilters: [{ externalId: workflowExternalId }],
      },
      limit: 10,
    });

    expect(Array.isArray(response.items)).toBe(true);
    expect(
      response.items.some(
        (item) =>
          item.workflowExternalId === workflowExternalId &&
          item.version === versionExternalId
      )
    ).toBe(true);
  });

  test('retrieve by workflow external id and version', async () => {
    const version = await client.workflowVersions.retrieve(
      workflowExternalId,
      versionExternalId
    );

    expect(version.workflowExternalId).toBe(workflowExternalId);
    expect(version.version).toBe(versionExternalId);
  });

  test('upsert updates existing workflow version', async () => {
    const items = await client.workflowVersions.upsert([
      {
        workflowExternalId,
        version: versionExternalId,
        workflowDefinition: {
          description: 'integration test workflow version - updated',
          tasks: [],
        },
      },
    ]);
    const updatedVersion = items[0];

    expect(updatedVersion.workflowDefinition.description).toBe(
      'integration test workflow version - updated'
    );
  });

  test('delete', async () => {
    const deleteVersionId = `delete-${randomInt()}`;

    const items = await client.workflowVersions.upsert([
      {
        workflowExternalId,
        version: deleteVersionId,
        workflowDefinition: {
          description: 'workflow version to delete',
          tasks: [],
        },
      },
    ]);
    const versionToDelete = items[0];

    expect(versionToDelete.version).toBe(deleteVersionId);

    await expect(
      client.workflowVersions.delete([
        {
          workflowExternalId,
          version: versionToDelete.version,
        },
      ])
    ).resolves.toBeDefined();
  });
});
