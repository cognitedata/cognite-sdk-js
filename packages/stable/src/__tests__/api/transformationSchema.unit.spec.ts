// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { TransformationSchemaColumn } from '../../types';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Transformation schema unit test', () => {
  let client: CogniteClient;

  const columns: TransformationSchemaColumn[] = [
    { name: 'externalId', sqlType: 'STRING', type: 'string', nullable: false },
    {
      name: 'labels',
      sqlType: 'ARRAY<STRING>',
      type: { type: 'array', elementType: 'string', containsNull: true },
      nullable: true,
    },
  ];

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('retrieve asset-centric schema with conflict mode', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/assets$/)
      .query({ conflictMode: 'upsert' })
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve(
      { type: 'assets' },
      'upsert'
    );
    expect(result).toEqual(columns);
  });

  test('retrieve without conflict mode sends no query params', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/raw$/)
      .query({})
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve({
      type: 'raw',
      database: 'db',
      table: 'table',
    });
    expect(result).toEqual(columns);
  });

  test('retrieve returns an empty list when items is missing', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/events$/)
      .query(true)
      .once()
      .reply(200, {});

    const result = await client.transformations.schema.retrieve({
      type: 'events',
    });
    expect(result).toEqual([]);
  });

  test('retrieve sequence rows schema', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/sequence_rows$/)
      .query({ externalId: 'my-sequence', conflictMode: 'abort' })
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve(
      { type: 'sequence_rows', externalId: 'my-sequence' },
      'abort'
    );
    expect(result).toEqual(columns);
  });

  test('retrieve view-centric nodes schema', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/instances$/)
      .query({
        conflictMode: 'upsert',
        viewSpace: 'my-space',
        viewExternalId: 'my-view',
        viewVersion: 'v1',
        instanceType: 'nodes',
        withInstanceSpace: 'true',
      })
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve(
      {
        type: 'nodes',
        view: { space: 'my-space', externalId: 'my-view', version: 'v1' },
        instanceSpace: 'my-instance-space',
      },
      'upsert'
    );
    expect(result).toEqual(columns);
  });

  test('retrieve edges schema for a connection definition', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/instances$/)
      .query({
        conflictMode: 'delete',
        instanceType: 'edges',
        withInstanceSpace: 'false',
        isConnectionDefinition: 'true',
      })
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve(
      {
        type: 'edges',
        edgeType: { space: 'my-space', externalId: 'my-edge-type' },
      },
      'delete'
    );
    expect(result).toEqual(columns);
  });

  test('retrieve data model-centric schema', async () => {
    nock(mockBaseUrl)
      .get(/\/transformations\/schema\/instances$/)
      .query({
        conflictMode: 'upsert',
        dataModelSpace: 'my-space',
        dataModelExternalId: 'my-model',
        dataModelVersion: '1',
        type: 'MyType',
        relationshipFromType: 'children',
      })
      .once()
      .reply(200, { items: columns });

    const result = await client.transformations.schema.retrieve(
      {
        type: 'instances',
        dataModel: {
          space: 'my-space',
          externalId: 'my-model',
          version: '1',
          destinationType: 'MyType',
          destinationRelationshipFromType: 'children',
        },
      },
      'upsert'
    );
    expect(result).toEqual(columns);
  });
});
