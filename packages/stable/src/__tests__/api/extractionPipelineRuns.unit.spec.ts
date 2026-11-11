// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  ExtractionPipelineRun,
  ExtractionPipelineRunCreate,
  ExtractionPipelineRunFilterQuery,
  ExtractionPipelineRunWithExternalId,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Extraction pipeline runs unit test', () => {
  let client: CogniteClient;

  const runCreate = {
    externalId: 'my-pipeline',
    status: 'failure',
    message: 'Connection timeout',
    createdTime: 1730000000000,
  } satisfies ExtractionPipelineRunCreate;

  const run: ExtractionPipelineRun = {
    id: 1,
    status: 'failure',
    message: 'Connection timeout',
    createdTime: 1730000000000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    const created: ExtractionPipelineRunWithExternalId = {
      ...run,
      externalId: 'my-pipeline',
    };
    nock(mockBaseUrl)
      .post(/\/extpipes\/runs$/, { items: [runCreate] })
      .once()
      .reply(200, { items: [created] });

    const response = await client.extractionPipelines.runs.create([runCreate]);
    expect(response).toEqual([created]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/extpipes\/runs\/?$/)
      .query({ externalId: 'my-pipeline', limit: '10' })
      .once()
      .reply(200, { items: [run], nextCursor: 'next' });

    const response = await client.extractionPipelines.runs.list({
      externalId: 'my-pipeline',
      limit: 10,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [run], nextCursor: 'next' });
  });

  test('filter', async () => {
    const query = {
      filter: {
        externalId: 'my-pipeline',
        statuses: ['failure', 'seen'],
        createdTime: { min: 1720000000000, max: 1740000000000 },
        message: { substring: 'timeout' },
      },
      limit: 10,
      cursor: 'abc',
    } satisfies ExtractionPipelineRunFilterQuery;
    nock(mockBaseUrl)
      .post(/\/extpipes\/runs\/list$/, query)
      .once()
      .reply(200, { items: [run], nextCursor: 'next' });

    const response = await client.extractionPipelines.runs.filter(query);
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [run], nextCursor: 'next' });
  });
});
