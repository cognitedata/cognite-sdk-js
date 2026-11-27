// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { StreamTemplate } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Streams unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  const template: StreamTemplate = {
    name: 'BasicArchive',
    type: 'Immutable',
    maxStreams: { provisioned: 2 },
    settings: {
      limits: {
        maxRecordsTotal: {
          type: 'fixed',
          name: 'Maximum total number of records',
          value: 50000000,
        },
        uniquePropertiesWithData: {
          type: 'fixed',
          name: 'Max number of unique properties with data across all records',
          value: 1000,
        },
        maxFilteringInterval: {
          type: 'fixed',
          name: 'Maximum range filter interval for the lastUpdatedTime property',
          value: 'PT8760H',
        },
      },
      lifecycle: {
        retainedAfterSoftDelete: {
          type: 'fixed',
          name: 'Stream stays in soft-deleted state before being hard-deleted',
          value: 'PT1008H',
        },
        dataDeletedAfter: {
          type: 'fixed',
          name: 'Data retention',
          value: 'infinity',
        },
      },
    },
  };

  test('list templates', async () => {
    nock(mockBaseUrl)
      .get(/\/streams\/templates$/)
      .once()
      .reply(200, { items: [template] });

    const templates = await client.streams.templates.list();
    expect(templates).toEqual([template]);
  });

  test('retrieve with statistics returns maxUniquePropertiesWithData', async () => {
    nock(mockBaseUrl)
      .get(/\/streams\/my_stream$/)
      .query({ includeStatistics: 'true' })
      .once()
      .reply(200, {
        externalId: 'my_stream',
        createdTime: 1730000000000,
        createdFromTemplate: 'BasicArchive',
        type: 'Immutable',
        settings: {
          lifecycle: { retainedAfterSoftDelete: 'PT1008H' },
          limits: {
            maxRecordsTotal: { provisioned: 50000000, consumed: 14 },
            maxGigaBytesTotal: { provisioned: 50, consumed: 0.000132 },
            maxUniquePropertiesWithData: { provisioned: 1000, consumed: 5 },
            maxFilteringInterval: 'PT8760H',
          },
        },
      });

    const stream = await client.streams.retrieve({
      externalId: 'my_stream',
      includeStatistics: true,
    });
    expect(stream.createdTime).toBeInstanceOf(Date);
    expect(stream.settings.limits.maxUniquePropertiesWithData).toEqual({
      provisioned: 1000,
      consumed: 5,
    });
  });
});
