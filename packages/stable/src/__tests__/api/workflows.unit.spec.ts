// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflows unit test', () => {
  let client: CogniteClient;

  const workflowFixture = {
    externalId: 'wf-1',
    description: 'Test workflow',
    dataSetId: 42,
    maxConcurrentExecutions: 3,
  };

  const mockWorkflow = {
    ...workflowFixture,
    createdTime: Date.now(),
    lastUpdatedTime: Date.now() + 1000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockWorkflow],
        nextCursor: 'next',
      });

    const response = await client.workflows.list({ limit: 10, cursor: 'abc' });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe(mockWorkflow.externalId);
    expect(response.nextCursor).toBe('next');
  });

  test('retrieve by external id', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/wf-2$/)
      .once()
      .reply(200, {
        ...mockWorkflow,
        externalId: 'wf-2',
      });

    const response = await client.workflows.retrieve('wf-2');
    expect(response.externalId).toEqual('wf-2');
  });

  test('upsert forwards maxConcurrentExecutions and dataSetId', async () => {
    const upsertBody = {
      externalId: 'wf-1',
      description: 'd',
      dataSetId: 42,
      maxConcurrentExecutions: 5,
    };
    nock(mockBaseUrl)
      .post(/\/workflows$/, matches({ items: [upsertBody] }))
      .once()
      .reply(200, {
        items: [
          {
            ...mockWorkflow,
            externalId: upsertBody.externalId,
            maxConcurrentExecutions: upsertBody.maxConcurrentExecutions,
          },
        ],
      });

    const response = await client.workflows.upsert([upsertBody]);

    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toEqual('wf-1');
    expect(response.items[0].maxConcurrentExecutions).toEqual(5);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/delete/, { items: [{ externalId: 'wf-1' }] })
      .once()
      .reply(200, {});

    await client.workflows.delete([{ externalId: 'wf-1' }]);
  });
});
