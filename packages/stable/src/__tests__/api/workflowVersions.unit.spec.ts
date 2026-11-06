// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  WorkflowVersion,
  WorkflowVersionFilterQuery,
  WorkflowVersionUpsert,
  WorkflowVersionUpsertResponse,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Workflow versions unit test', () => {
  let client: CogniteClient;

  const versionUpsert = {
    workflowExternalId: 'wf-1',
    version: '1',
    workflowDefinition: {
      description: 'Test version',
      tasks: [
        {
          externalId: 'task-1',
          type: 'function',
          parameters: {
            function: { externalId: 'fn-1', data: '${workflow.input}' },
          },
        },
        {
          externalId: 'task-2',
          type: 'cdf',
          parameters: {
            cdfRequest: { resourcePath: '/timeseries', method: 'GET' },
          },
          dependsOn: [{ externalId: 'task-1' }],
          onFailure: 'skipTask',
        },
      ],
    },
  } satisfies WorkflowVersionUpsert;

  const version: WorkflowVersion = {
    ...versionUpsert,
    workflowDefinition: { ...versionUpsert.workflowDefinition, hash: 'abc' },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('upsert sends one request per version and returns warnings', async () => {
    const otherUpsert = { ...versionUpsert, version: '2' };
    const upserted: WorkflowVersionUpsertResponse = {
      ...version,
      warnings: ['Function "fn-1" is not ready'],
    };
    const otherUpserted: WorkflowVersionUpsertResponse = {
      ...version,
      version: '2',
      warnings: null,
    };
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, { items: [versionUpsert] })
      .once()
      .reply(200, { items: [upserted] });
    nock(mockBaseUrl)
      .post(/\/workflows\/versions$/, { items: [otherUpsert] })
      .once()
      .reply(200, { items: [otherUpserted] });

    const response = await client.workflows.versions.upsert([
      versionUpsert,
      otherUpsert,
    ]);
    expect(response).toEqual([upserted, otherUpserted]);
  });

  test('list', async () => {
    const query = {
      filter: { workflowFilters: [{ externalId: 'wf-1', version: '1' }] },
      limit: 10,
      cursor: 'abc',
    } satisfies WorkflowVersionFilterQuery;
    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/list$/, query)
      .once()
      .reply(200, { items: [version], nextCursor: 'next' });

    const response = await client.workflows.versions.list(query);
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [version], nextCursor: 'next' });
  });

  test('list sends an empty body without a query', async () => {
    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/list$/, {})
      .once()
      .reply(200, { items: [version] });

    const response = await client.workflows.versions.list();
    expect(response.items).toEqual([version]);
  });

  test('retrieve encodes the workflow external id and version', async () => {
    nock(mockBaseUrl)
      .get(/\/workflows\/wf%201\/versions\/v%2F1$/)
      .once()
      .reply(200, version);

    const retrieved = await client.workflows.versions.retrieve('wf 1', 'v/1');
    expect(retrieved).toEqual(version);
  });

  test('delete sends ignoreUnknownIds as a query parameter', async () => {
    const ids = [{ workflowExternalId: 'wf-1', version: '1' }];
    nock(mockBaseUrl)
      .post(/\/workflows\/versions\/delete/, { items: ids })
      .query({ ignoreUnknownIds: 'true' })
      .once()
      .reply(200, {});

    const response = await client.workflows.versions.delete(ids, {
      ignoreUnknownIds: true,
    });
    expect(response).toEqual({});
  });
});
