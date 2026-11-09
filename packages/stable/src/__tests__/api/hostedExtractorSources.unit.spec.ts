// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  HostedExtractorSource,
  HostedExtractorSourceChange,
  HostedExtractorSourceCreate,
  HostedExtractorSourceMqtt5,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Hosted extractor sources unit test', () => {
  let client: CogniteClient;

  const sourceCreate = {
    type: 'mqtt5',
    externalId: 'my-mqtt-broker',
    host: 'mqtt.example.com',
    authentication: { type: 'basic', username: 'user', password: 'secret' },
    authCertificate: {
      type: 'pem',
      certificate: '-----BEGIN CERTIFICATE-----',
      key: '-----BEGIN PRIVATE KEY-----',
    },
  } satisfies HostedExtractorSourceCreate;

  const source: HostedExtractorSourceMqtt5 = {
    type: 'mqtt5',
    externalId: 'my-mqtt-broker',
    host: 'mqtt.example.com',
    port: 1883,
    authentication: { type: 'basic', username: 'user' },
    authCertificate: { thumbprint: 'abc123', expiresAt: 1760000000000 },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const kafkaSource: HostedExtractorSource = {
    type: 'kafka',
    externalId: 'my-kafka',
    bootstrapBrokers: [{ host: 'kafka.example.com', port: 9092 }],
    authentication: { type: 'scramSha512', username: 'user' },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const sourcesPath = /\/hostedextractors\/sources$/;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(sourcesPath, { items: [sourceCreate] })
      .once()
      .reply(200, { items: [source] });

    const created = await client.hostedExtractors.sources.create([
      sourceCreate,
    ]);
    expect(created).toEqual([source]);
  });

  test.each([
    {
      name: 'create',
      chunkSize: 10,
      path: sourcesPath,
      makeItem: (i: number) => ({ ...sourceCreate, externalId: `source-${i}` }),
      call: (items: HostedExtractorSourceCreate[]) =>
        client.hostedExtractors.sources.create(items),
    },
    {
      name: 'update',
      chunkSize: 10,
      path: /\/hostedextractors\/sources\/update$/,
      makeItem: (i: number) =>
        ({
          type: 'mqtt5',
          externalId: `source-${i}`,
          update: { host: { set: 'mqtt2.example.com' } },
        }) satisfies HostedExtractorSourceChange,
      call: (items: HostedExtractorSourceChange[]) =>
        client.hostedExtractors.sources.update(items),
    },
    {
      name: 'retrieve',
      chunkSize: 100,
      path: /\/hostedextractors\/sources\/byIds$/,
      makeItem: (i: number) => ({ externalId: `source-${i}` }),
      call: (items: { externalId: string }[]) =>
        client.hostedExtractors.sources.retrieve(items),
    },
    {
      name: 'delete',
      chunkSize: 100,
      path: /\/hostedextractors\/sources\/delete$/,
      makeItem: (i: number) => ({ externalId: `source-${i}` }),
      call: (items: { externalId: string }[]) =>
        client.hostedExtractors.sources.delete(items),
    },
  ])(
    '$name sends at most $chunkSize items per request',
    async ({ chunkSize, path, makeItem, call }) => {
      const items = Array.from({ length: chunkSize + 1 }, (_, i) =>
        makeItem(i)
      );
      const firstChunk = nock(mockBaseUrl)
        .post(path, (body) => body.items.length === chunkSize)
        .once()
        .reply(200, { items: [] });
      const secondChunk = nock(mockBaseUrl)
        .post(path, (body) => body.items.length === 1)
        .once()
        .reply(200, { items: [] });

      // biome-ignore lint/suspicious/noExplicitAny: items type varies per case
      await call(items as any);
      expect(firstChunk.isDone() && secondChunk.isDone()).toBe(true);
    }
  );

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/sources\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, { items: [source, kafkaSource], nextCursor: 'next' });

    const response = await client.hostedExtractors.sources.list({
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [source, kafkaSource], nextCursor: 'next' });
  });

  test('retrieve uses the byIds path', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/sources\/byIds$/, {
        items: [{ externalId: 'my-mqtt-broker' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [source] });

    const retrieved = await client.hostedExtractors.sources.retrieve(
      [{ externalId: 'my-mqtt-broker' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([source]);
  });

  test('update', async () => {
    const change = {
      type: 'mqtt5',
      externalId: 'my-mqtt-broker',
      update: {
        host: { set: 'mqtt2.example.com' },
        port: { setNull: true },
        authentication: {
          set: { type: 'basic', username: 'user', password: 'new-secret' },
        },
        metadata: { add: { site: 'oslo' }, remove: ['old'] },
      },
    } satisfies HostedExtractorSourceChange;
    const updated = { ...source, host: 'mqtt2.example.com' };
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/sources\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.hostedExtractors.sources.update([change]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/sources\/delete$/, {
        items: [{ externalId: 'my-mqtt-broker' }],
        ignoreUnknownIds: true,
        force: true,
      })
      .once()
      .reply(200, {});

    const response = await client.hostedExtractors.sources.delete(
      [{ externalId: 'my-mqtt-broker' }],
      { ignoreUnknownIds: true, force: true }
    );
    expect(response).toEqual({});
  });

  test('read types do not include write-only secrets', () => {
    const readSource: HostedExtractorSourceMqtt5 = {
      ...source,
      // @ts-expect-error passwords are only sent on create and update
      authentication: { type: 'basic', username: 'user', password: 'secret' },
    };
    expect(readSource.type).toBe('mqtt5');
  });
});
