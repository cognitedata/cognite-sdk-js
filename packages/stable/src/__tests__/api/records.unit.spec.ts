// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const streamId = 'my_stream';
const viewRef = {
  type: 'view' as const,
  space: 'mySpace',
  externalId: 'myView',
  version: 'v1',
};

/**
 * Intercepts the next POST to the given records sub-path and captures the
 * request body so the serialization can be asserted.
 */
const interceptRecordsPost = (
  path: string,
  reply: object,
  captured: { body?: unknown }
) =>
  nock(mockBaseUrl)
    .post(
      (uri) => uri.includes(`/streams/${streamId}/records${path}`),
      (body) => {
        captured.body = body;
        return true;
      }
    )
    .reply(200, reply);

describe('Records unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  test('ingest posts view source bodies verbatim', async () => {
    const captured: { body?: unknown } = {};
    interceptRecordsPost('', {}, captured);

    await client.records.ingest(streamId, [
      {
        space: 'mySpace',
        externalId: 'record1',
        sources: [
          {
            source: viewRef,
            properties: { recordName: 'a', recordValue: 1 },
          },
        ],
      },
    ]);

    expect(captured.body).toEqual({
      items: [
        {
          space: 'mySpace',
          externalId: 'record1',
          sources: [
            {
              source: {
                type: 'view',
                space: 'mySpace',
                externalId: 'myView',
                version: 'v1',
              },
              properties: { recordName: 'a', recordValue: 1 },
            },
          ],
        },
      ],
    });
  });

  test('filter sends view sources, hasData, and view property paths untouched', async () => {
    const captured: { body?: unknown } = {};
    interceptRecordsPost('/filter', { items: [] }, captured);

    // Both source kinds type-check, though the API rejects mixing them in a
    // single request.
    const request = {
      sources: [{ source: viewRef, properties: ['*'] }],
      filter: {
        and: [
          { hasData: [viewRef] },
          {
            equals: {
              property: ['mySpace', 'myView/v1', 'recordName'] as [
                string,
                string,
                string,
              ],
              value: 'a',
            },
          },
        ],
      },
      targetUnits: {
        properties: [
          {
            property: ['mySpace', 'myView/v1', 'temp'] as [
              string,
              string,
              string,
            ],
            unit: { externalId: 'temperature:k' },
          },
        ],
      },
    };
    await client.records.filter(streamId, request);

    expect(captured.body).toEqual(request);
  });

  test('filter response keyed by viewExternalId/version survives the date transform', async () => {
    const captured: { body?: unknown } = {};
    interceptRecordsPost(
      '/filter',
      {
        items: [
          {
            space: 'mySpace',
            externalId: 'record1',
            createdTime: 1700000000000,
            lastUpdatedTime: 1700000001000,
            properties: {
              mySpace: {
                'myView/v1': { recordName: 'a', recordValue: 1 },
              },
            },
          },
        ],
        typing: {
          mySpace: {
            'myView/v1': {
              recordValue: {
                nullable: true,
                defaultValue: null,
                type: { type: 'float64', list: false },
              },
            },
          },
        },
      },
      captured
    );

    const { items, typing } = await client.records.filter(streamId, {
      sources: [{ source: viewRef, properties: ['*'] }],
      includeTyping: true,
    });

    expect(items).toHaveLength(1);
    const record = items[0];
    expect(record.createdTime).toBeInstanceOf(Date);
    expect(record.createdTime.getTime()).toBe(1700000000000);
    expect(record.lastUpdatedTime).toBeInstanceOf(Date);
    // The slash-keyed nesting must pass through the transform unmangled.
    expect(record.properties.mySpace['myView/v1']).toEqual({
      recordName: 'a',
      recordValue: 1,
    });
    expect(typing?.mySpace['myView/v1'].recordValue.type).toEqual({
      type: 'float64',
      list: false,
    });
  });
});
