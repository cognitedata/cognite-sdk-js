// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Workflow, WorkflowUpsert } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflows unit test', () => {
  let client: CogniteClient;

  const workflowUpsert = {
    externalId: 'wf-1',
    description: 'Test workflow',
    dataSetId: 42,
    maxConcurrentExecutions: 3,
  } satisfies WorkflowUpsert;

  const workflow: Workflow = {
    ...workflowUpsert,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('upsert sends one request per workflow', async () => {
    const otherUpsert = {
      externalId: 'wf-2',
      maxConcurrentExecutions: null,
    } satisfies WorkflowUpsert;
    const otherWorkflow: Workflow = {
      ...otherUpsert,
      createdTime: 1730000002000,
      lastUpdatedTime: 1730000003000,
    };
    nock(mockBaseUrl)
      .post(/\/workflows\/?$/, { items: [workflowUpsert] })
      .once()
      .reply(200, { items: [workflow] });
    nock(mockBaseUrl)
      .post(/\/workflows\/?$/, { items: [otherUpsert] })
      .once()
      .reply(200, { items: [otherWorkflow] });

    const upserted = await client.workflows.upsert([
      workflowUpsert,
      otherUpsert,
    ]);
    expect(upserted).toEqual([workflow, otherWorkflow]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [workflow], nextCursor: 'next' });

    const response = await client.workflows.list({ limit: 10, cursor: 'abc' });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [workflow], nextCursor: 'next' });
  });

  test('retrieve encodes the external id', async () => {
    const retrievedWorkflow = { ...workflow, externalId: 'wf 1/a' };
    nock(mockBaseUrl)
      .get(/\/workflows\/wf%201%2Fa$/)
      .once()
      .reply(200, retrievedWorkflow);

    const retrieved = await client.workflows.retrieve('wf 1/a');
    expect(retrieved).toEqual(retrievedWorkflow);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/delete$/, { items: [{ externalId: 'wf-1' }] })
      .once()
      .reply(200, {});

    const response = await client.workflows.delete([{ externalId: 'wf-1' }]);
    expect(response).toEqual({});
  });

  test('delete sends ignoreUnknownIds as a query parameter', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/delete/, { items: [{ externalId: 'wf-1' }] })
      .query({ ignoreUnknownIds: 'false' })
      .once()
      .reply(200, {});

    const response = await client.workflows.delete([{ externalId: 'wf-1' }], {
      ignoreUnknownIds: false,
    });
    expect(response).toEqual({});
  });

  test('delete sends at most 100 ids per request', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => ({
      externalId: `wf-${i}`,
    }));
    const firstChunk = nock(mockBaseUrl)
      .post(/\/workflows\/delete$/, { items: ids.slice(0, 100) })
      .once()
      .reply(200, {});
    const secondChunk = nock(mockBaseUrl)
      .post(/\/workflows\/delete$/, { items: ids.slice(100) })
      .once()
      .reply(200, {});

    await client.workflows.delete(ids);
    expect(firstChunk.isDone() && secondChunk.isDone()).toBe(true);
  });
});
