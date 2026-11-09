// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Workflows unit test', () => {
  let client: CogniteClientAlpha;

  const workflowFixture = {
    externalId: 'wf-1',
    description: 'Test workflow',
    dataSetId: 42,
    maxConcurrentExecutions: 3,
  };

  const mockWorkflow = {
    ...workflowFixture,
    isDataAware: false,
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

  test('upsert forwards isDataAware', async () => {
    const upsertBody = {
      externalId: 'wf-data-aware',
      isDataAware: true,
    };
    nock(mockBaseUrl)
      .post(/\/workflows$/, matches({ items: [upsertBody] }))
      .once()
      .reply(200, {
        items: [
          {
            ...mockWorkflow,
            externalId: upsertBody.externalId,
            isDataAware: true,
          },
        ],
      });

    const items = await client.workflows.upsert([upsertBody]);

    expect(items).toHaveLength(1);
    expect(items[0].isDataAware).toBe(true);
  });

  test('upsert forwards maxConcurrentExecutions, dataSetId, and dataDomainExternalId', async () => {
    const upsertBody = {
      externalId: 'wf-1',
      description: 'd',
      dataSetId: 42,
      maxConcurrentExecutions: 5,
      dataDomainExternalId: 'my-data-domain',
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
            dataDomainExternalId: upsertBody.dataDomainExternalId,
          },
        ],
      });

    const items = await client.workflows.upsert([upsertBody]);

    expect(items).toHaveLength(1);
    expect(items[0].externalId).toEqual('wf-1');
    expect(items[0].maxConcurrentExecutions).toEqual(5);
    expect(items[0].dataDomainExternalId).toEqual('my-data-domain');
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/delete/, { items: [{ externalId: 'wf-1' }] })
      .once()
      .reply(200, {});

    await client.workflows.delete([{ externalId: 'wf-1' }]);
  });

  test('versions sub-API sends the alpha cdf-version header', async () => {
    const version = { workflowExternalId: 'wf-1', version: '1' };
    nock(mockBaseUrl, {
      reqheaders: { 'cdf-version': '20230101-alpha' },
    })
      .get(/\/workflows\/wf-1\/versions\/1$/)
      .once()
      .reply(200, version);

    const response = await client.workflows.versions.retrieve('wf-1', '1');
    expect(response).toEqual(version);
  });

  test('executions sub-API sends the alpha cdf-version header', async () => {
    const execution = {
      id: 'execution-1',
      workflowExternalId: 'wf-1',
      status: 'RUNNING',
      engineExecutionId: 'engine-1',
      createdTime: 1730000000000,
      metadata: {},
    };
    nock(mockBaseUrl, {
      reqheaders: { 'cdf-version': '20230101-alpha' },
    })
      .post(/\/workflows\/executions\/list$/, {})
      .once()
      .reply(200, { items: [execution] });

    const response = await client.workflows.executions.list();
    expect(response.items).toEqual([execution]);
  });

  test('tasks sub-API sends the alpha cdf-version header', async () => {
    const task = {
      id: 'task-1',
      externalId: 'task-1',
      status: 'COMPLETED',
      taskType: 'function',
      input: {},
      output: {},
    };
    nock(mockBaseUrl, {
      reqheaders: { 'cdf-version': '20230101-alpha' },
    })
      .post(/\/workflows\/tasks\/task-1\/update$/, { status: 'COMPLETED' })
      .once()
      .reply(200, task);

    const response = await client.workflows.tasks.update('task-1', {
      status: 'COMPLETED',
    });
    expect(response).toEqual(task);
  });

  test('triggers sub-API sends the alpha cdf-version header', async () => {
    nock(mockBaseUrl, {
      reqheaders: { 'cdf-version': '20230101-alpha' },
    })
      .post(/\/workflows\/triggers\/trigger-1\/pause$/)
      .once()
      .reply(200, {});

    const response = await client.workflows.triggers.pause('trigger-1');
    expect(response).toEqual({});
  });
});
