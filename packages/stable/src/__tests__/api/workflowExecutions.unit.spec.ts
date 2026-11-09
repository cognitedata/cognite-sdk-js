// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  WorkflowExecution,
  WorkflowExecutionDetailed,
  WorkflowExecutionFilterQuery,
  WorkflowExecutionRunRequest,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflow executions unit test', () => {
  let client: CogniteClient;

  const executionId = '550e8400-e29b-41d4-a716-446655440000';

  const execution: WorkflowExecution = {
    id: executionId,
    workflowExternalId: 'wf-1',
    version: '1',
    status: 'RUNNING',
    engineExecutionId: '660e8400-e29b-41d4-a716-446655440001',
    createdTime: 1730000000000,
    startTime: 1730000000001,
    metadata: { source: 'test' },
  };

  const executionDetailed: WorkflowExecutionDetailed = {
    ...execution,
    workflowDefinition: {
      hash: 'abc',
      tasks: [
        {
          externalId: 'task-1',
          type: 'function',
          parameters: { function: { externalId: 'fn-1' } },
        },
      ],
    },
    executedTasks: [
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        externalId: 'task-1',
        status: 'COMPLETED',
        taskType: 'function',
        input: { function: { externalId: 'fn-1' } },
        output: { callId: 1, functionId: 2, response: { ok: true } },
      },
    ],
    input: { key: 'value' },
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('run encodes the workflow external id and version', async () => {
    const request = {
      authentication: { nonce: 'nonce' },
      input: { key: 'value' },
      metadata: { source: 'test' },
    } satisfies WorkflowExecutionRunRequest;
    nock(mockBaseUrl)
      .post(/\/workflows\/wf%201\/versions\/v%2F1\/run$/, request)
      .once()
      .reply(202, execution);

    const response = await client.workflows.executions.run(
      'wf 1',
      'v/1',
      request
    );
    expect(response).toEqual(execution);
  });

  test('list', async () => {
    const query = {
      filter: {
        workflowFilters: [{ externalId: 'wf-1', version: '1' }],
        createdTimeStart: 1730000000000,
        createdTimeEnd: 1730000005000,
        status: ['RUNNING', 'FAILED'],
      },
      limit: 10,
      cursor: 'abc',
    } satisfies WorkflowExecutionFilterQuery;
    nock(mockBaseUrl)
      .post(/\/workflows\/executions\/list$/, query)
      .once()
      .reply(200, { items: [execution], nextCursor: 'next' });

    const response = await client.workflows.executions.list(query);
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [execution], nextCursor: 'next' });
  });

  test('list sends an empty body without a query', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/executions\/list$/, {})
      .once()
      .reply(200, { items: [execution] });

    const response = await client.workflows.executions.list();
    expect(response.items).toEqual([execution]);
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000$/)
      .once()
      .reply(200, executionDetailed);

    const response = await client.workflows.executions.retrieve(executionId);
    expect(response).toEqual(executionDetailed);
  });

  test('cancel sends the reason', async () => {
    const cancelled: WorkflowExecution = { ...execution, status: 'TERMINATED' };
    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/cancel$/,
        { reason: 'test' }
      )
      .once()
      .reply(200, cancelled);

    const response = await client.workflows.executions.cancel(executionId, {
      reason: 'test',
    });
    expect(response).toEqual(cancelled);
  });

  test('cancel sends an empty body without a request', async () => {
    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/cancel$/,
        {}
      )
      .once()
      .reply(200, execution);

    const response = await client.workflows.executions.cancel(executionId);
    expect(response).toEqual(execution);
  });

  test('retry', async () => {
    const request = { authentication: { nonce: 'nonce' } };
    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/retry$/,
        request
      )
      .once()
      .reply(200, execution);

    const response = await client.workflows.executions.retry(
      executionId,
      request
    );
    expect(response).toEqual(execution);
  });
});
