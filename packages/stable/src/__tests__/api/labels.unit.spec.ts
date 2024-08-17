// Copyright 2020 Cognite AS

import matches from 'lodash/matches';
import nock from 'nock';
import { beforeAll, describe, expect, test } from 'vitest';
import type { CogniteClient, ExternalLabelDefinition } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('Labels unit test', () => {
  let client: CogniteClient;
  const externalLabels: ExternalLabelDefinition[] = [
    { externalId: 'PUMP', name: 'Pump' },
    {
      externalId: 'ROTATING_EQUIPMENT',
      name: 'Pump',
      description: 'Asset with rotating parts',
    },
  ];
  const labels = externalLabels.map((label) => {
    return {
      ...label,
      createdTime: new Date(),
    };
  });
  beforeAll(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });
  test('create', async () => {
    nock(mockBaseUrl)
      .post(
        /\/labels/,
        matches({
          items: externalLabels,
        }),
      )
      .once()
      .reply(201, {
        items: labels,
      });
    const createdLabels = await client.labels.create(externalLabels);
    expect(createdLabels).toEqual(labels);
  });

  test('list', async () => {
    nock(mockBaseUrl)
      .post(/\/labels\/list/, {
        filter: { name: labels[0].name },
        cursor: 'abc',
        limit: 123,
      })
      .once()
      .reply(200, {
        items: labels,
      });
    const fetchedLabels = await client.labels.list({
      cursor: 'abc',
      limit: 123,
      filter: { name: labels[0].name },
    });
    expect(fetchedLabels).toEqual({
      items: labels,
      next: undefined,
    });
  });

  test('list with next page', async () => {
    nock(mockBaseUrl)
      .post(/\/labels\/list/, {
        filter: { name: labels[0].name },
      })
      .once()
      .reply(200, {
        items: labels,
        nextCursor: 'def',
      });
    const { items, next } = await client.labels.list({
      filter: { name: labels[0].name },
    });
    expect(items).toEqual(labels);
    expect(items[0].createdTime).toBeInstanceOf(Date);
    expect(next).toBeDefined();
  });

  test('delete', async () => {
    const externalIds = labels.map((label) => {
      return { externalId: label.externalId };
    });
    nock(mockBaseUrl)
      .post(/\/labels\/delete/, {
        items: externalIds,
      })
      .once()
      .reply(200, {});
    await client.labels.delete(externalIds);
  });
});
