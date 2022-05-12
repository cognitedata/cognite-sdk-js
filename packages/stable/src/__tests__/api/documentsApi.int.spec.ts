// Copyright 2022 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import { DocumentSearchResponse } from '@cognite/sdk-stable/dist';
import { TextEncoder } from 'util';

describe('Documents integration test', () => {
  let client: CogniteClient;
  let fileId: number;

  beforeAll(async () => {
    client = setupLoggedInClient();

    // ensure we have a file for testing
    try {
      const resp = await client.documents.list({
        limit: 1,
      });
      fileId = resp.items[0].id;
    } catch (error) {
      const fileContent = new TextEncoder().encode('test data');
      const file = await client.files.upload(
        {
          name: 'test.txt',
          mimeType: 'text/plain',
        },
        fileContent,
        false,
        true
      );
      fileId = file.id;
    }
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

  describe('document preview', () => {
    let documents: DocumentSearchResponse;

    beforeAll(async () => {
      documents = await client.documents.search({
        limit: 1,
        filter: {
          equals: { property: ['mimeType'], value: 'application/pdf' },
        },
      });
    });

    test('fetch image preview', async () => {
      if (documents.items.length == 0) {
        return;
      }
      const document = documents.items[0].item;

      await client.documents.preview.documentAsImage(document.id, 1);
    });

    test('fetch pdf preview', async () => {
      if (documents.items.length == 0) {
        return;
      }
      const document = documents.items[0].item;

      const resp = await client.documents.preview.documentAsPdf(document.id);

      const pdfPrefix = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
      expect(resp.byteLength).toBeGreaterThan(pdfPrefix.length);
      const frontSlice = resp.slice(0, pdfPrefix.length);
      expect(frontSlice.byteLength).toStrictEqual(pdfPrefix.length);
      const match = Buffer.from(frontSlice, 0).equals(
        Buffer.from(pdfPrefix, 0)
      );
      expect(match).toBe(true);
    });

    test('fetch temporary link', async () => {
      if (documents.items.length == 0) {
        return;
      }
      const document = documents.items[0].item;

      const resp = await client.documents.preview.pdfTemporaryLink(document.id);
      expect(resp.temporaryLink).toBeDefined();
    });
  });

  test('list', async () => {
    const response = await client.documents.list({
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toBeDefined();
    expect(response.items[0].id).toBeDefined();
  });

  test('content', async () => {
    const response = await client.documents.content(fileId);
    expect(response).toBeDefined();
  });
});
