// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { WorkflowTaskExecution, WorkflowTaskUpdate } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflow tasks unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('update encodes the task id and sends status and output', async () => {
    const update = {
      status: 'COMPLETED',
      output: { key: 'value' },
    } satisfies WorkflowTaskUpdate;
    const task: WorkflowTaskExecution = {
      id: 'task/1',
      externalId: 'task-1',
      status: 'COMPLETED',
      taskType: 'function',
      startTime: 1730000000000,
      endTime: 1730000001000,
      input: { function: { externalId: 'fn-1' }, isAsyncComplete: true },
      output: { callId: 1, functionId: 2, response: { key: 'value' } },
    };
    nock(mockBaseUrl)
      .post(/\/workflows\/tasks\/task%2F1\/update$/, update)
      .once()
      .reply(200, task);

    const response = await client.workflows.tasks.update('task/1', update);
    expect(response).toEqual(task);
  });
});
