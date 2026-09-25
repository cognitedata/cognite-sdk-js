// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type { Version } from '../../api/workflows/types';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Workflow versions unit test', () => {
  let client: CogniteClientAlpha;

  const versionCreateBody = {
    workflowExternalId: 'wf-1',
    version: '1',
    workflowDefinition: {
      description: 'Test version',
      tasks: [
        {
          externalId: 'task-1',
          type: 'function',
          parameters: {
            function: { externalId: 'fn-1' },
          },
        },
      ],
    },
  };

  const mockVersion = {
    ...versionCreateBody,
    workflowDefinition: {
      ...versionCreateBody.workflowDefinition,
      hash: 'abc123',
    },
    createdTime: 1716900000000,
    lastUpdatedTime: 1716900001000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    const listQuery = {
      filter: {
        workflowFilters: [{ externalId: 'wf-1', version: '1' }],
      },
      limit: 10,
      cursor: 'abc',
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/list$/, listQuery)
      .once()
      .reply(200, {
        items: [mockVersion],
        nextCursor: 'next',
      });

    const response = await client.workflowVersions.list(listQuery);
    expect(response.items).toHaveLength(1);
    expect(response.items[0].workflowExternalId).toBe(
      mockVersion.workflowExternalId
    );
    expect(response.nextCursor).toBe('next');
  });

  test('list() response type does not expose warnings', async () => {
    const listQuery = {
      filter: {
        workflowFilters: [{ externalId: 'wf-1', version: '1' }],
      },
      limit: 10,
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/list$/, listQuery)
      .once()
      .reply(200, {
        items: [mockVersion],
      });

    const response = await client.workflowVersions.list(listQuery);
    const item: Version = response.items[0];

    // @ts-expect-error `warnings` only exists on VersionUpsertResponse (returned by upsert), not on Version (returned by list/get)
    expect(item.warnings).toBeUndefined();
  });

  test('upsert', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [mockVersion],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].workflowExternalId).toEqual('wf-1');
    expect(items[0].version).toEqual('1');
    expect(items[0].workflowDefinition.hash).toEqual('abc123');
  });

  test('upsert surfaces warnings when the API returns them', async () => {
    const versionWithWarnings = {
      ...mockVersion,
      warnings: ['Task "task-1" has no timeout set'],
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [versionWithWarnings],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].warnings).toEqual(['Task "task-1" has no timeout set']);
  });

  test('upsert has no warnings when the API does not return any', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, matches({ items: [versionCreateBody] }))
      .once()
      .reply(200, {
        items: [mockVersion],
      });

    const items = await client.workflowVersions.upsert([versionCreateBody]);

    expect(items).toHaveLength(1);
    expect(items[0].warnings).toBeUndefined();
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/delete/, {
        items: [{ workflowExternalId: 'wf-1', version: '1' }],
      })
      .once()
      .reply(200, {});

    await client.workflowVersions.delete([
      { workflowExternalId: 'wf-1', version: '1' },
    ]);
  });
});
