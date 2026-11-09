// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  WorkflowTrigger,
  WorkflowTriggerRun,
  WorkflowTriggerUpsert,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflow triggers unit test', () => {
  let client: CogniteClient;

  const scheduleUpsert = {
    externalId: 'trigger-1',
    triggerRule: {
      triggerType: 'schedule',
      cronExpression: '0 * * * *',
      timezone: 'Europe/Oslo',
    },
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    input: { key: 'value' },
    metadata: { source: 'sdk-test' },
    authentication: { nonce: 'session-nonce' },
  } satisfies WorkflowTriggerUpsert;

  const dataModelingUpsert = {
    externalId: 'trigger-2',
    triggerRule: {
      triggerType: 'dataModeling',
      dataModelingQuery: {
        with: {
          pumps: {
            nodes: {
              filter: {
                hasData: [
                  {
                    type: 'view',
                    space: 'my-space',
                    externalId: 'Pump',
                    version: 'v1',
                  },
                ],
              },
            },
            limit: 10,
          },
        },
        select: { pumps: {} },
      },
      batchSize: 10,
      batchTimeout: 60,
    },
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    authentication: { nonce: 'other-nonce' },
  } satisfies WorkflowTriggerUpsert;

  const recordStreamUpsert = {
    externalId: 'trigger-3',
    triggerRule: {
      triggerType: 'recordStream',
      streamExternalId: 'my-stream',
      filter: {
        equals: {
          property: ['my-space', 'MyContainer', 'status'],
          value: 'ok',
        },
      },
      sources: [
        {
          source: {
            type: 'container',
            space: 'my-space',
            externalId: 'MyContainer',
          },
          properties: ['*'],
        },
      ],
      initializeCursor: '2d-ago',
      batchSize: 100,
      batchTimeout: 300,
    },
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    authentication: { nonce: 'third-nonce' },
  } satisfies WorkflowTriggerUpsert;

  const toTrigger = ({
    authentication: _,
    ...item
  }: WorkflowTriggerUpsert): WorkflowTrigger => ({
    ...item,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
    isPaused: false,
  });

  const run: WorkflowTriggerRun = {
    fireTime: 1730000002000,
    externalId: 'trigger-1',
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    workflowExecutionId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'success',
    reasonForFailure: null,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('upsert sends one request per trigger', async () => {
    const items = [scheduleUpsert, dataModelingUpsert, recordStreamUpsert];
    for (const item of items) {
      nock(mockBaseUrl)
        .post(/\/workflows\/triggers$/, { items: [item] })
        .once()
        .reply(200, { items: [toTrigger(item)] });
    }

    const response = await client.workflows.triggers.upsert(items);
    expect(response).toEqual(items.map(toTrigger));
  });

  test('list', async () => {
    const trigger = toTrigger(scheduleUpsert);
    nock(mockBaseUrl)
      .get(/\/workflows\/triggers$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [trigger], nextCursor: 'next' });

    const response = await client.workflows.triggers.list({
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [trigger], nextCursor: 'next' });
  });

  test('delete sends one request per trigger', async () => {
    for (const externalId of ['trigger-1', 'trigger-2']) {
      nock(mockBaseUrl)
        .post(/\/workflows\/triggers\/delete$/, { items: [{ externalId }] })
        .once()
        .reply(200, {});
    }

    const response = await client.workflows.triggers.delete([
      { externalId: 'trigger-1' },
      { externalId: 'trigger-2' },
    ]);
    expect({ response, done: nock.isDone() }).toEqual({
      response: {},
      done: true,
    });
  });

  test('delete sends the requests in sequence', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/delete$/, {
        items: [{ externalId: 'trigger-1' }],
      })
      .once()
      .reply(400, { error: { code: 400, message: 'bad trigger' } });
    const second = nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/delete$/, {
        items: [{ externalId: 'trigger-2' }],
      })
      .once()
      .reply(200, {});

    await expect(
      client.workflows.triggers.delete([
        { externalId: 'trigger-1' },
        { externalId: 'trigger-2' },
      ])
    ).rejects.toThrow();
    expect(second.isDone()).toBe(false);
  });

  test('listRuns encodes the trigger external id', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/triggers\/my%20trigger%2F1\/history$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [run], nextCursor: 'next' });

    const response = await client.workflows.triggers.listRuns('my trigger/1', {
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [run], nextCursor: 'next' });
  });

  test('pause', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/my%20trigger\/pause$/)
      .once()
      .reply(200, {});

    const response = await client.workflows.triggers.pause('my trigger');
    expect(response).toEqual({});
  });

  test('resume', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/my%20trigger\/resume$/)
      .once()
      .reply(200, {});

    const response = await client.workflows.triggers.resume('my trigger');
    expect(response).toEqual({});
  });
});
