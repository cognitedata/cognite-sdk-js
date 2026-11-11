// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ExtractionPipeline,
  ExtractionPipelineChange,
  ExtractionPipelineCreate,
  ExtractionPipelineFilterQuery,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Extraction pipelines unit test', () => {
  let client: CogniteClient;

  const pipelineCreate = {
    externalId: 'my-pipeline',
    name: 'My pipeline',
    dataSetId: 123,
    schedule: 'Continuous',
    rawTables: [{ dbName: 'db', tableName: 'table' }],
    contacts: [
      {
        name: 'Me',
        email: 'me@example.com',
        role: 'Owner',
        sendNotification: true,
      },
    ],
    notificationConfig: { allowedNotSeenRangeInMinutes: 60 },
  } satisfies ExtractionPipelineCreate;

  const pipeline: ExtractionPipeline = {
    ...pipelineCreate,
    id: 1,
    lastSuccess: 1730000002000,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
    createdBy: 'me@example.com',
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes$/, { items: [pipelineCreate] })
      .once()
      .reply(200, { items: [pipeline] });

    const created = await client.extractionPipelines.create([pipelineCreate]);
    expect(created).toEqual([pipeline]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/extpipes\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [pipeline], nextCursor: 'next' });

    const response = await client.extractionPipelines.list({
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [pipeline], nextCursor: 'next' });
  });

  test('filter', async () => {
    const query = {
      filter: {
        externalIdPrefix: 'my-',
        dataSetIds: [{ id: 123 }, { externalId: 'my-data-set' }],
        createdTime: { min: 1730000000000 },
      },
      limit: 10,
    } satisfies ExtractionPipelineFilterQuery;
    nock(mockBaseUrl)
      .post(/\/extpipes\/list$/, query)
      .once()
      .reply(200, { items: [pipeline] });

    const response = await client.extractionPipelines.filter(query);
    expect(response.items).toEqual([pipeline]);
  });

  test('filter without a query sends an empty body', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes\/list$/, {})
      .once()
      .reply(200, { items: [pipeline] });

    const response = await client.extractionPipelines.filter();
    expect(response.items).toEqual([pipeline]);
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes\/byids$/, {
        items: [{ id: 1 }, { externalId: 'my-pipeline' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [pipeline] });

    const retrieved = await client.extractionPipelines.retrieve(
      [{ id: 1 }, { externalId: 'my-pipeline' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([pipeline]);
  });

  test('update', async () => {
    const change = {
      externalId: 'my-pipeline',
      update: {
        description: { set: null },
        rawTables: { add: [{ dbName: 'db', tableName: 'other' }] },
        contacts: { set: [] },
        metadata: { remove: ['key'] },
      },
    } satisfies ExtractionPipelineChange;
    nock(mockBaseUrl)
      .post(/\/extpipes\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [pipeline] });

    const updated = await client.extractionPipelines.update([change]);
    expect(updated).toEqual([pipeline]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/extpipes\/delete$/, {
        items: [{ id: 1 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {});

    const response = await client.extractionPipelines.delete([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(response).toEqual({});
  });
});
