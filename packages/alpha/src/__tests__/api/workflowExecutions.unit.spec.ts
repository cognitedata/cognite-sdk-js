// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Workflow executions unit test', () => {
  let client: CogniteClientAlpha;

  const executionId = '550e8400-e29b-41d4-a716-446655440000';
  const engineExecutionId = '660e8400-e29b-41d4-a716-446655440001';

  const mockExecution = {
    id: executionId,
    workflowExternalId: 'wf-1',
    status: 'RUNNING' as const,
    engineExecutionId,
    createdTime: 1716900000000,
    metadata: { source: 'test' },
    version: '1',
    startTime: 1716900000001,
  };

  const mockExecutionDetails = {
    ...mockExecution,
    workflowDefinition: {
      hash: 'abc123',
      description: 'Test workflow',
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
    executedTasks: [
      {
        id: 'task-exec-1',
        externalId: 'task-1',
        status: 'IN_PROGRESS',
        taskType: 'function',
        input: { function: { externalId: 'fn-1' } },
        output: {},
      },
    ],
    input: { key: 'value' },
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    const listQuery = {
      filter: {
        workflowFilters: [{ externalId: 'wf-1', version: '1' }],
        status: ['RUNNING' as const],
      },
      limit: 10,
      cursor: 'abc',
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/executions\/list$/, listQuery)
      .once()
      .reply(200, {
        items: [mockExecution],
        nextCursor: 'next',
      });

    const response = await client.workflowExecutions.list(listQuery);
    expect(response.items).toHaveLength(1);
    expect(response.items[0].id).toBe(executionId);
    expect(response.items[0].status).toBe('RUNNING');
    expect(response.nextCursor).toBe('next');
  });

  test('retrieve by execution id', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000$/)
      .once()
      .reply(200, mockExecutionDetails);

    const response = await client.workflowExecutions.retrieve(executionId);
    expect(response.id).toEqual(executionId);
    expect(response.workflowDefinition.hash).toEqual('abc123');
    expect(response.executedTasks).toHaveLength(1);
    expect(response.executedTasks[0].externalId).toEqual('task-1');
  });

  test('run', async () => {
    const runRequest = {
      authentication: { nonce: 'session-nonce' },
      input: { key: 'value' },
      metadata: { source: 'sdk-test' },
    };

    nock(mockBaseUrl)
      .post(/\/workflows\/wf-1\/versions\/1\/run$/, matches(runRequest))
      .once()
      .reply(202, mockExecution);

    const response = await client.workflowExecutions.run(
      'wf-1',
      '1',
      runRequest
    );

    expect(response.id).toEqual(executionId);
    expect(response.workflowExternalId).toEqual('wf-1');
    expect(response.status).toEqual('RUNNING');
  });

  test('retry', async () => {
    const retryRequest = {
      authentication: { nonce: 'session-nonce' },
    };

    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/retry$/,
        matches(retryRequest)
      )
      .once()
      .reply(200, { ...mockExecution, status: 'RUNNING' });

    const response = await client.workflowExecutions.retry(
      executionId,
      retryRequest
    );

    expect(response.id).toEqual(executionId);
    expect(response.status).toEqual('RUNNING');
  });

  test('cancel', async () => {
    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/cancel$/,
        {}
      )
      .once()
      .reply(200, { ...mockExecution, status: 'TERMINATED' });

    const response = await client.workflowExecutions.cancel(executionId);

    expect(response.id).toEqual(executionId);
    expect(response.status).toEqual('TERMINATED');
  });

  test('cancel with reason', async () => {
    const cancelRequest = { reason: 'no longer needed' };

    nock(mockBaseUrl)
      .post(
        /\/workflows\/executions\/550e8400-e29b-41d4-a716-446655440000\/cancel$/,
        matches(cancelRequest)
      )
      .once()
      .reply(200, {
        ...mockExecution,
        status: 'TERMINATED',
        reasonForIncompletion: 'no longer needed',
      });

    const response = await client.workflowExecutions.cancel(
      executionId,
      cancelRequest
    );

    expect(response.status).toEqual('TERMINATED');
    expect(response.reasonForIncompletion).toEqual('no longer needed');
  });
});
