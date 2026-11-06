// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  HostedExtractorMapping,
  HostedExtractorMappingChange,
  HostedExtractorMappingCreate,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Hosted extractor mappings unit test', () => {
  let client: CogniteClient;

  const mappingCreate = {
    externalId: 'my-mapping',
    mapping: { expression: '{ "value": input.value }' },
    input: {
      type: 'protobuf',
      messageName: 'Root',
      files: [{ fileName: 'root.proto', content: 'syntax = "proto3";' }],
    },
    published: true,
    metadata: { site: 'oslo' },
  } satisfies HostedExtractorMappingCreate;

  const mapping: HostedExtractorMapping = {
    externalId: 'my-mapping',
    mapping: { expression: '{ "value": input.value }' },
    input: {
      type: 'protobuf',
      messageName: 'Root',
      files: [{ fileName: 'root.proto' }],
    },
    published: true,
    metadata: { site: 'oslo' },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const csvMapping: HostedExtractorMapping = {
    externalId: 'my-csv-mapping',
    mapping: { expression: 'input' },
    input: { type: 'csv', delimiter: ';', customKeys: ['a', 'b'] },
    published: false,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const mappingsPath = /\/hostedextractors\/mappings$/;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(mappingsPath, { items: [mappingCreate] })
      .once()
      .reply(200, { items: [mapping] });

    const created = await client.hostedExtractors.mappings.create([
      mappingCreate,
    ]);
    expect(created).toEqual([mapping]);
  });

  test('create sends at most 10 items per request', async () => {
    const items = Array.from({ length: 11 }, (_, i) => ({
      ...mappingCreate,
      externalId: `mapping-${i}`,
    }));
    const firstChunk = nock(mockBaseUrl)
      .post(mappingsPath, { items: items.slice(0, 10) })
      .once()
      .reply(200, { items: [mapping] });
    const secondChunk = nock(mockBaseUrl)
      .post(mappingsPath, { items: items.slice(10) })
      .once()
      .reply(200, { items: [csvMapping] });

    const created = await client.hostedExtractors.mappings.create(items);
    expect({
      created,
      done: firstChunk.isDone() && secondChunk.isDone(),
    }).toEqual({ created: [mapping, csvMapping], done: true });
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/mappings\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [mapping, csvMapping], nextCursor: 'next' });

    const response = await client.hostedExtractors.mappings.list({
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [mapping, csvMapping], nextCursor: 'next' });
  });

  test('retrieve uses the byIds path', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/mappings\/byIds$/, {
        items: [{ externalId: 'my-mapping' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [mapping] });

    const retrieved = await client.hostedExtractors.mappings.retrieve(
      [{ externalId: 'my-mapping' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([mapping]);
  });

  test('update', async () => {
    const change = {
      externalId: 'my-mapping',
      update: {
        mapping: { set: { expression: 'input' } },
        input: { set: { type: 'xml' } },
        published: { set: false },
        name: { set: 'My mapping' },
        description: { setNull: true },
        metadata: { add: { site: 'bergen' }, remove: ['old'] },
      },
    } satisfies HostedExtractorMappingChange;
    const updated: HostedExtractorMapping = {
      ...mapping,
      mapping: { expression: 'input' },
      input: { type: 'xml' },
      published: false,
      name: 'My mapping',
    };
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/mappings\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.hostedExtractors.mappings.update([change]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/mappings\/delete$/, {
        items: [{ externalId: 'my-mapping' }],
        ignoreUnknownIds: true,
        force: true,
      })
      .once()
      .reply(200, {});

    const response = await client.hostedExtractors.mappings.delete(
      [{ externalId: 'my-mapping' }],
      { ignoreUnknownIds: true, force: true }
    );
    expect(response).toEqual({});
  });

  test('read types do not include protobuf file contents', () => {
    const readMapping: HostedExtractorMapping = {
      ...mapping,
      input: {
        type: 'protobuf',
        messageName: 'Root',
        // @ts-expect-error file contents are only sent on create and update
        files: [{ fileName: 'root.proto', content: 'syntax = "proto3";' }],
      },
    };
    expect(readMapping.input.type).toBe('protobuf');
  });
});
