// Copyright 2022 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('Documents integration test', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('search with limit 1', async () => {
    const response = await client.documents.search({
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].item).toBeDefined();
    expect(response.items[0].item.id).toBeDefined();
  });

  test('search with sorting', async () => {
    const response = await client.documents.search({
      sort: [
        {
          property: ['id'],
          order: 'asc',
        },
      ],
      limit: 5,
    });
    expect(response.items).toHaveLength(5);
    expect(response.items[0].item.id).toBeLessThan(response.items[1].item.id);
    expect(response.items[1].item.id).toBeLessThan(response.items[2].item.id);
    expect(response.items[2].item.id).toBeLessThan(response.items[3].item.id);
    expect(response.items[3].item.id).toBeLessThan(response.items[4].item.id);
  });

  test('search with query', async () => {
    const response = await client.documents.search({
      search: {
        query: 'test',
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].item).toBeDefined();
    expect(response.items[0].item.id).toBeDefined();
  });

  test('search with range filter', async () => {
    const response = await client.documents.search({
      filter: {
        range: {
          property: ['sourceFile', 'size'],
          gte: 10,
          lte: 900533317,
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
  });

  test('search with missing property', async () => {
    const response = await client.documents.search({
      filter: {
        not: {
          exists: {
            property: ['geoLocation'],
          },
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
  });

  test('search with aggregate', async () => {
    const response = await client.documents.search({
      aggregates: [
        {
          name: 'labels',
          aggregate: 'count',
          groupBy: [{ property: ['labels'] }],
        },
      ],
      limit: 0,
    });
    expect(response.items).toHaveLength(0);
    expect(response.aggregates).toHaveLength(1);
    expect(response.aggregates![0].name).toBe('labels');
    expect(response.aggregates![0].total).toBeGreaterThan(0);
    expect(response.aggregates![0].groups.length).toBeGreaterThan(0);
    expect(response.aggregates![0].groups[0].group).toHaveLength(1);
    expect(response.aggregates![0].groups[0].group[0].property).toStrictEqual([
      'labels',
    ]);
  });
});
