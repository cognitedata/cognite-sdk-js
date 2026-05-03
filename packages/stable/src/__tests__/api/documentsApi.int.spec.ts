// Copyright 2022 Cognite AS

import { TextEncoder } from 'node:util';
import type { DocumentSearchResponse } from '@cognite/sdk-stable';
import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

const getFileId = async (
  client: CogniteClient,
  deadline = 15000
): Promise<number> => {
  // Use a previous uploaded file/document if available,
  // otherwise ingest a new file.

  async function lookup() {
    const resp = await client.documents.list({
      limit: 1,
    });
    return resp.items.length > 0 ? resp.items[0].id : undefined;
  }

  const found = await lookup();
  if (found) {
    return found;
  }

  const fileContent = new TextEncoder().encode('test data');
  await client.files.upload(
    {
      name: 'test.txt',
      mimeType: 'text/plain',
    },
    fileContent,
    false,
    true
  );

  // It takes some time for a uploaded file to become available
  // in the documents API.

  let timeLeft = deadline;
  while (timeLeft > 0) {
    const timeout = Math.min(timeLeft, 3000);
    await new Promise((resolve) => setTimeout(resolve, timeout));
    timeLeft -= timeout;

    const foundOnRetry = await lookup();
    if (foundOnRetry) {
      return foundOnRetry;
    }
  }

  throw new Error(
    'unable to ingest a file into the documents service within time'
  );
};

describe('Documents integration test', { timeout: 3 * 60_000 }, () => {
  let client: CogniteClient;
  let fileId: number;

  beforeAll(async () => {
    client = setupLoggedInClient();
    fileId = await getFileId(client);
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

  describe('document preview', { timeout: 3 * 60_000 }, () => {
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
      if (documents.items.length === 0) {
        return;
      }
      const document = documents.items[0].item;

      await client.documents.preview.documentAsImage(document.id, 1);
    });

    // The "documentAsPdf" method currently takes more than 60s to respond, need to address this with backend team
    test.skip(
      'fetch pdf preview',
      async () => {
        if (documents.items.length === 0) {
          return;
        }
        const document = documents.items[0].item;

        const resp = await client.documents.preview.documentAsPdf(document.id);

        const pdfPrefix = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
        expect(resp.byteLength).toBeGreaterThan(pdfPrefix.length);
        const frontSlice = resp.slice(0, pdfPrefix.length);
        expect(frontSlice.byteLength).toStrictEqual(pdfPrefix.length);
        const match = Buffer.from(frontSlice, 0).equals(Buffer.from(pdfPrefix));
        expect(match).toBe(true);
      },
      60 * 1000
    );

    test('fetch temporary link', async () => {
      if (documents.items.length === 0) {
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

  test('document aggregate count', async () => {
    const resp = await client.documents.aggregate.count({
      filter: {
        equals: {
          property: ['type'],
          value: 'PDF',
        },
      },
    });
    expect(resp).toEqual(expect.any(Number));
  });

  test('document aggregate uniqueValues', async () => {
    const resp = await client.documents.aggregate.uniqueValues({
      properties: [{ property: ['mimeType'] }],
    });
    expect(resp.length).toBeGreaterThanOrEqual(1);
    expect(resp[0].count).toBeGreaterThan(0);
    expect(resp[0].values).toHaveLength(1);
  });

  test('document aggregate allUniqueValues', async () => {
    const resp = await client.documents.aggregate.allUniqueValues({
      properties: [{ property: ['mimeType'] }],
    });
    expect(resp.items.length).toBeGreaterThanOrEqual(1);
    expect(resp.items[0].count).toBeGreaterThan(0);
    expect(resp.items[0].values).toHaveLength(1);
  });
});
