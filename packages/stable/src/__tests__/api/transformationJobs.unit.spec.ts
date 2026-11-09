// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { TransformationJob, TransformationJobMetric } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformation jobs unit test', () => {
  let client: CogniteClient;

  const job: TransformationJob = {
    id: 10,
    uuid: '6b8f7c3e-0000-0000-0000-000000000000',
    transformationId: 1,
    transformationExternalId: 'my-transformation',
    sourceProject: 'test-project',
    destinationProject: 'test-project',
    destination: { type: 'assets' },
    conflictMode: 'upsert',
    query: 'select * from `db`.`table`',
    ignoreNullFields: true,
    status: 'Completed',
    createdTime: 1730000002000,
    startedTime: 1730000003000,
    finishedTime: 1730000004000,
  };

  const metric: TransformationJobMetric = {
    name: 'assets.create',
    count: 5,
    timestamp: 1730000004000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/jobs\/?$/)
      .query({ limit: '10', transformationExternalId: 'my-transformation' })
      .once()
      .reply(200, { items: [job], nextCursor: 'next' });

    const response = await client.transformations.jobs.list({
      limit: 10,
      transformationExternalId: 'my-transformation',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [job], nextCursor: 'next' });
  });

  test('retrieve', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/jobs\/byids$/, { items: [{ id: 10 }] })
      .once()
      .reply(200, { items: [job] });

    const retrieved = await client.transformations.jobs.retrieve([{ id: 10 }]);
    expect(retrieved).toEqual([job]);
  });

  test('retrieve passes ignoreUnknownIds', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/jobs\/byids$/, {
        items: [{ id: 10 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [job] });

    const retrieved = await client.transformations.jobs.retrieve([{ id: 10 }], {
      ignoreUnknownIds: true,
    });
    expect(retrieved).toEqual([job]);
  });

  test('listMetrics', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/jobs\/10\/metrics$/)
      .once()
      .reply(200, { items: [metric] });

    const metrics = await client.transformations.jobs.listMetrics(10);
    expect(metrics).toEqual([metric]);
  });
});
