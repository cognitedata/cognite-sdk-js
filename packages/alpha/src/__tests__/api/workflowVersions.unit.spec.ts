// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
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
    createdTime: Date.now(),
    lastUpdatedTime: Date.now() + 1000,
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
