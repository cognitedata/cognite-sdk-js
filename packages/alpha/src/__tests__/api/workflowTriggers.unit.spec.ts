// Copyright 2026 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Workflow triggers unit test', () => {
  let client: CogniteClientAlpha;

  const triggerUpsertBody = {
    externalId: 'trigger-1',
    triggerRule: {
      triggerType: 'schedule' as const,
      cronExpression: '0 * * * *',
      timezone: 'UTC',
    },
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    authentication: { nonce: 'session-nonce' },
    input: { key: 'value' },
    metadata: { source: 'sdk-test' },
  };

  const mockTrigger = {
    externalId: triggerUpsertBody.externalId,
    triggerRule: triggerUpsertBody.triggerRule,
    workflowExternalId: triggerUpsertBody.workflowExternalId,
    workflowVersion: triggerUpsertBody.workflowVersion,
    input: triggerUpsertBody.input,
    metadata: triggerUpsertBody.metadata,
    createdTime: 1716900000000,
    lastUpdatedTime: 1716900001000,
    isPaused: false,
  };

  const mockTriggerRun = {
    fireTime: 1716900002000,
    externalId: 'trigger-1',
    workflowExternalId: 'wf-1',
    workflowVersion: '1',
    status: 'success' as const,
    workflowExecutionId: '550e8400-e29b-41d4-a716-446655440000',
    reasonForFailure: null,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/triggers\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockTrigger],
        nextCursor: 'next',
      });

    const response = await client.workflowTriggers.list({
      limit: 10,
      cursor: 'abc',
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('trigger-1');
    expect(response.items[0].triggerRule.triggerType).toBe('schedule');
    expect(response.nextCursor).toBe('next');
  });

  test('upsert', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers$/, matches({ items: [triggerUpsertBody] }))
      .once()
      .reply(200, {
        items: [mockTrigger],
      });

    const items = await client.workflowTriggers.upsert([triggerUpsertBody]);

    expect(items).toHaveLength(1);
    expect(items[0].externalId).toEqual('trigger-1');
    expect(items[0].workflowExternalId).toEqual('wf-1');
    expect(items[0].isPaused).toEqual(false);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/delete/, {
        items: [{ externalId: 'trigger-1' }],
      })
      .once()
      .reply(200, {});

    await client.workflowTriggers.delete([{ externalId: 'trigger-1' }]);
  });

  test('pause', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/trigger-1\/pause$/)
      .once()
      .reply(200, {});

    await client.workflowTriggers.pause('trigger-1');
  });

  test('resume', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/triggers\/trigger-1\/resume$/)
      .once()
      .reply(200, {});

    await client.workflowTriggers.resume('trigger-1');
  });

  test('history', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/triggers\/trigger-1\/history$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [mockTriggerRun],
        nextCursor: 'next',
      });

    const response = await client.workflowTriggers.history('trigger-1', {
      limit: 10,
      cursor: 'abc',
    });

    expect(response.items).toHaveLength(1);
    expect(response.items[0].externalId).toBe('trigger-1');
    expect(response.items[0].status).toBe('success');
    expect(response.nextCursor).toBe('next');
  });
});
