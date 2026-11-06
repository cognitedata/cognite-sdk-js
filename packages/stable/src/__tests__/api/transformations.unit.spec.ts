// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  Transformation,
  TransformationCreate,
  TransformationJob,
} from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformations unit test', () => {
  let client: CogniteClient;

  const transformationCreate = {
    externalId: 'my-transformation',
    name: 'My transformation',
    ignoreNullFields: true,
    query: 'select * from `db`.`table`',
    destination: { type: 'assets' },
    conflictMode: 'upsert',
  } satisfies TransformationCreate;

  const transformation: Transformation = {
    id: 1,
    externalId: 'my-transformation',
    name: 'My transformation',
    ignoreNullFields: true,
    query: 'select * from `db`.`table`',
    destination: { type: 'assets' },
    conflictMode: 'upsert',
    isPublic: true,
    createdTime: 1730000000000,
    lastUpdatedTime: 1730000001000,
    owner: 'me',
    ownerIsCurrentUser: true,
    hasSourceOidcCredentials: false,
    hasDestinationOidcCredentials: false,
  };

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
    status: 'Created',
    createdTime: 1730000002000,
  };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('create', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations$/, {
        items: [transformationCreate],
      })
      .once()
      .reply(200, { items: [transformation] });

    const created = await client.transformations.create([transformationCreate]);
    expect(created).toEqual([transformation]);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/?$/)
      .query({ limit: '10', includePublic: 'false', withJobDetails: 'false' })
      .once()
      .reply(200, { items: [transformation], nextCursor: 'next' });

    const response = await client.transformations.list({
      limit: 10,
      includePublic: false,
      withJobDetails: false,
    });
    expect({
      items: response.items,
      nextCursor: response.nextCursor,
    }).toEqual({ items: [transformation], nextCursor: 'next' });
  });

  test('filter', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/filter$/, {
        filter: { destinationType: 'assets', tags: { containsAny: ['a'] } },
        limit: 5,
      })
      .once()
      .reply(200, { items: [transformation] });

    const response = await client.transformations.filter({
      filter: { destinationType: 'assets', tags: { containsAny: ['a'] } },
      limit: 5,
    });
    expect(response.items).toEqual([transformation]);
  });

  test('retrieve requests job details by default', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/byids$/, {
        items: [{ id: 1 }, { externalId: 'my-transformation' }],
        withJobDetails: true,
      })
      .once()
      .reply(200, { items: [transformation, transformation] });

    const retrieved = await client.transformations.retrieve([
      { id: 1 },
      { externalId: 'my-transformation' },
    ]);
    expect(retrieved).toEqual([transformation, transformation]);
  });

  test('retrieve requests job details when the flag is undefined', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/byids$/, {
        items: [{ id: 1 }],
        withJobDetails: true,
      })
      .once()
      .reply(200, { items: [transformation] });

    const retrieved = await client.transformations.retrieve([{ id: 1 }], {
      withJobDetails: undefined,
    });
    expect(retrieved).toEqual([transformation]);
  });

  test('retrieve passes flags', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/byids$/, {
        items: [{ id: 1 }],
        ignoreUnknownIds: true,
        withJobDetails: false,
      })
      .once()
      .reply(200, { items: [transformation] });

    const retrieved = await client.transformations.retrieve([{ id: 1 }], {
      ignoreUnknownIds: true,
      withJobDetails: false,
    });
    expect(retrieved).toEqual([transformation]);
  });

  test('update', async () => {
    const change = {
      externalId: 'my-transformation',
      update: {
        query: { set: 'select 1' },
        dataSetId: { setNull: true as const },
        tags: { add: ['a'] },
      },
    };
    nock(mockBaseUrl)
      .post(/\/transformations\/update$/, {
        items: [change],
      })
      .once()
      .reply(200, { items: [{ ...transformation, query: 'select 1' }] });

    const updated = await client.transformations.update([change]);
    expect(updated).toEqual([{ ...transformation, query: 'select 1' }]);
  });

  test('delete', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/delete$/, {
        items: [{ id: 1 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {});

    const response = await client.transformations.delete([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(response).toEqual({});
  });

  test('run', async () => {
    const nonce = {
      sessionId: 42,
      nonce: 'nonce',
      cdfProjectName: 'test-project',
    };
    nock(mockBaseUrl)
      .post(/\/transformations\/run$/, {
        externalId: 'my-transformation',
        nonce,
      })
      .once()
      .reply(200, job);

    const response = await client.transformations.run({
      externalId: 'my-transformation',
      nonce,
    });
    expect(response).toEqual(job);
  });

  test('cancel', async () => {
    nock(mockBaseUrl)
      .post(/\/transformations\/cancel$/, { id: 1 })
      .once()
      .reply(200, {});

    const response = await client.transformations.cancel({ id: 1 });
    expect(response).toEqual({});
  });
});
