// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  HostedExtractorDestination,
  HostedExtractorDestinationChange,
  HostedExtractorDestinationCreate,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Hosted extractor destinations unit test', () => {
  let client: CogniteClient;

  const destinationCreate = {
    externalId: 'my-destination',
    credentials: { nonce: 'my-nonce' },
    targetDataSetId: 123,
    name: 'My destination',
    metadata: { site: 'oslo' },
  } satisfies HostedExtractorDestinationCreate;

  const destination: HostedExtractorDestination = {
    externalId: 'my-destination',
    sessionId: 42,
    targetDataSetId: 123,
    name: 'My destination',
    metadata: { site: 'oslo' },
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const otherDestination: HostedExtractorDestination = {
    externalId: 'other-destination',
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
  };

  const destinationsPath = /\/hostedextractors\/destinations$/;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(destinationsPath, { items: [destinationCreate] })
      .once()
      .reply(200, { items: [destination] });

    const created = await client.hostedExtractors.destinations.create([
      destinationCreate,
    ]);
    expect(created).toEqual([destination]);
  });

  test('create sends at most 10 items per request', async () => {
    const items = Array.from({ length: 11 }, (_, i) => ({
      ...destinationCreate,
      externalId: `destination-${i}`,
    }));
    const firstChunk = nock(mockBaseUrl)
      .post(destinationsPath, { items: items.slice(0, 10) })
      .once()
      .reply(200, { items: [destination] });
    const secondChunk = nock(mockBaseUrl)
      .post(destinationsPath, { items: items.slice(10) })
      .once()
      .reply(200, { items: [otherDestination] });

    const created = await client.hostedExtractors.destinations.create(items);
    expect({
      created,
      done: firstChunk.isDone() && secondChunk.isDone(),
    }).toEqual({ created: [destination, otherDestination], done: true });
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/hostedextractors\/destinations\/?$/)
      .query({ limit: '10', cursor: 'abc' })
      .once()
      .reply(200, {
        items: [destination, otherDestination],
        nextCursor: 'next',
      });

    const response = await client.hostedExtractors.destinations.list({
      limit: 10,
      cursor: 'abc',
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [destination, otherDestination], nextCursor: 'next' });
  });

  test('retrieve uses the byIds path', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/destinations\/byIds$/, {
        items: [{ externalId: 'my-destination' }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, { items: [destination] });

    const retrieved = await client.hostedExtractors.destinations.retrieve(
      [{ externalId: 'my-destination' }],
      { ignoreUnknownIds: true }
    );
    expect(retrieved).toEqual([destination]);
  });

  test('update', async () => {
    const change = {
      externalId: 'my-destination',
      update: {
        credentials: { set: { nonce: 'new-nonce' } },
        targetDataSetId: { setNull: true },
        name: { set: 'Renamed' },
        description: { setNull: true },
        metadata: { add: { line: '2' }, remove: ['site'] },
      },
    } satisfies HostedExtractorDestinationChange;
    const updated: HostedExtractorDestination = {
      externalId: 'my-destination',
      sessionId: 43,
      name: 'Renamed',
      metadata: { line: '2' },
      createdTime: 1730000000000,
      lastUpdatedTime: 1730000002000,
    };
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/destinations\/update$/, { items: [change] })
      .once()
      .reply(200, { items: [updated] });

    const response = await client.hostedExtractors.destinations.update([
      change,
    ]);
    expect(response).toEqual([updated]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/hostedextractors\/destinations\/delete$/, {
        items: [{ externalId: 'my-destination' }],
        ignoreUnknownIds: true,
        force: true,
      })
      .once()
      .reply(200, {});

    const response = await client.hostedExtractors.destinations.delete(
      [{ externalId: 'my-destination' }],
      { ignoreUnknownIds: true, force: true }
    );
    expect(response).toEqual({});
  });

  test('read types do not include write-only credentials', () => {
    const readDestination: HostedExtractorDestination = {
      ...destination,
      // @ts-expect-error credentials are only sent on create and update
      credentials: { nonce: 'my-nonce' },
    };
    expect(readDestination.externalId).toBe('my-destination');
  });
});
