// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  HostedExtractorJob,
  HostedExtractorJobChange,
  HostedExtractorJobCreate,
  HostedExtractorJobDlqMessage,
  HostedExtractorJobLog,
  HostedExtractorJobMetric,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Hosted extractor jobs unit test', () => {
  let client: CogniteClient;

  const jobCreate = {
    externalId: 'my-mqtt-job',
    sourceId: 'my-mqtt-broker',
    destinationId: 'my-destination',
    format: { type: 'custom', mappingId: 'my-mapping', encoding: 'utf8' },
    config: { topicFilter: 'sensors/#' },
  } satisfies HostedExtractorJobCreate;

  const job: HostedExtractorJob = {
    externalId: 'my-mqtt-job',
    sourceId: 'my-mqtt-broker',
    destinationId: 'my-destination',
    format: {
      type: 'custom',
      mappingId: 'my-mapping',
      encoding: 'utf8',
      expression: 'input',
    },
    targetStatus: 'running',
    status: 'running',
    config: { topicFilter: 'sensors/#' },
    dlqEnabled: false,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const restJob: HostedExtractorJob = {
    externalId: 'my-rest-job',
    sourceId: 'my-rest-server',
    destinationId: 'my-destination',
    format: { type: 'value', prefix: { prefix: 'rest:' } },
    targetStatus: 'paused',
    status: 'paused',
    config: {
      interval: '1h',
      path: '/api/data',
      method: 'post',
      body: { page: 1 },
      pagination: { type: 'nextUrl', value: 'body.next' },
      incrementalLoad: { type: 'queryParam', key: 'since', value: 'now()' },
    },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const jobsPath = /\/hostedextractors\/jobs$/;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(jobsPath, { items: [jobCreate] })
      .once()
      .reply(200, { items: [job] });

    const created = await client.hostedExtractors.jobs.create([jobCreate]);
    expect(created).toEqual([job]);
  });

  test('create sends at most 10 items per request', async () => {
    const items = Array.from({ length: 11 }, (_, i) => ({
      ...jobCreate,
      externalId: `job-${i}`,
    }));
    const firstChunk = nock(mockBaseUrl)
      .post(jobsPath, { items: items.slice(0, 10) })
      .once()
      .reply(200, { items: [job] });
    const secondChunk = nock(mockBaseUrl)
      .post(jobsPath, { items: items.slice(10) })
      .once()
      .reply(200, { items: [restJob] });

    const created = await client.hostedExtractors.jobs.create(items);
    expect({
      created,
      done: firstChunk.isDone() && secondChunk.isDone(),
    }).toEqual({ created: [job, restJob], done: true });
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/jobs\/?$/)
      .query({
        limit: '10',
        cursor: 'abc',
        source: 'my-mqtt-broker',
        destination: 'my-destination',
        mapping: 'my-mapping',
      })
      .once()
      .reply(200, { items: [job, restJob], nextCursor: 'next' });

    const response = await client.hostedExtractors.jobs.list({
      limit: 10,
      cursor: 'abc',
      source: 'my-mqtt-broker',
      destination: 'my-destination',
      mapping: 'my-mapping',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [job, restJob], nextCursor: 'next' });
  });

  test('retrieve uses the byIds path', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/jobs\/byIds$/, {
        items: [{ externalId: 'my-mqtt-job' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [job] });

    const retrieved = await client.hostedExtractors.jobs.retrieve(
      [{ externalId: 'my-mqtt-job' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([job]);
  });

  test('update', async () => {
    const change = {
      externalId: 'my-mqtt-job',
      update: {
        targetStatus: { set: 'paused' },
        format: { set: { type: 'sparkplug' } },
        config: { set: { topic: 'sensors', partitions: 2 } },
        dlqEnabled: { set: true },
        name: { setNull: true },
        metadata: { set: { site: 'oslo' } },
      },
    } satisfies HostedExtractorJobChange;
    const updated: HostedExtractorJob = {
      ...job,
      targetStatus: 'paused',
      dlqEnabled: true,
    };
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/jobs\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.hostedExtractors.jobs.update([change]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/jobs\/delete$/, {
        items: [{ externalId: 'my-mqtt-job' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {});

    const response = await client.hostedExtractors.jobs.delete(
      [{ externalId: 'my-mqtt-job' }],
      { ignoreUnknownIds: true }
    );
    expect(response).toEqual({});
  });

  test('listLogs follows the cursor', async () => {
    const logs: HostedExtractorJobLog[] = [
      { jobExternalId: 'my-mqtt-job', type: 'ok', createdTime: 1730000002000 },
      {
        jobExternalId: 'my-mqtt-job',
        type: 'transform_error',
        message: 'Unexpected token',
        createdTime: 1730000001000,
      },
    ];
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/jobs\/logs$/)
      .query({ job: 'my-mqtt-job', limit: '1' })
      .once()
      .reply(200, { items: [logs[0]], nextCursor: 'next' });
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/jobs\/logs$/)
      .query({ job: 'my-mqtt-job', limit: '1', cursor: 'next' })
      .once()
      .reply(200, { items: [logs[1]] });

    const response = await client.hostedExtractors.jobs
      .listLogs({ job: 'my-mqtt-job', limit: 1 })
      .autoPagingToArray({ limit: 10 });
    expect(response).toEqual(logs);
  });

  test('listMetrics', async () => {
    const metric: HostedExtractorJobMetric = {
      jobExternalId: 'my-mqtt-job',
      timestamp: 1730000000000,
      sourceMessages: 10,
      sourceBytes: 1024,
      cdfInputValues: 10,
      cdfRequests: 1,
      transformFailures: 0,
      cdfWriteFailures: 0,
      cdfSkippedValues: 0,
      cdfFailedValues: 0,
      cdfUploadedValues: 10,
    };
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/jobs\/metrics$/)
      .query({ source: 'my-mqtt-broker', destination: 'my-destination' })
      .once()
      .reply(200, { items: [metric] });

    const response = await client.hostedExtractors.jobs.listMetrics({
      source: 'my-mqtt-broker',
      destination: 'my-destination',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [metric], nextCursor: undefined });
  });

  test('listDlqMessages', async () => {
    const message: HostedExtractorJobDlqMessage = {
      key: 'row-1',
      columns: {
        timestamp: '2026-11-06T12:00:00Z',
        jobId: 42,
        mappingExternalId: 'my-mapping',
        rawPayload: 'e30=',
        decodedPayload: '{}',
        error: 'Missing field "value"',
        errorCategory: 'missing_field',
        metadata: null,
        extraColumn: 'kept as stored',
      },
    };
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/jobs\/dlq$/)
      .query({
        job: 'my-mqtt-job',
        minLastUpdatedTime: '1730000000000',
        maxLastUpdatedTime: '1730000005000',
      })
      .once()
      .reply(200, { items: [message], nextCursor: 'next' });

    const response = await client.hostedExtractors.jobs.listDlqMessages({
      job: 'my-mqtt-job',
      minLastUpdatedTime: 1730000000000,
      maxLastUpdatedTime: 1730000005000,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [message], nextCursor: 'next' });
  });

  test('read format includes the mapping expression', () => {
    const createFormat: HostedExtractorJobCreate['format'] = {
      type: 'custom',
      mappingId: 'my-mapping',
      // @ts-expect-error the expression is only returned, not sent
      expression: 'input',
    };
    expect(createFormat.type).toBe('custom');
  });
});
