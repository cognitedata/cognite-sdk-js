// Copyright 2020 Cognite AS

import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient } from '../testUtils';
import { ListResponse } from '@cognite/sdk-core';
import { Document } from '@cognite/sdk-playground';

describe('documents api', () => {
  let client: CogniteClientPlayground;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('list documents', async () => {
    const response = await client.documents.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('list documents, limit to 1', async () => {
    const response = await client.documents.list({ limit: 1 });
    expect(response.items).toHaveLength(1);
  });
  test('list documents, by size', async () => {
    const response = await client.documents.list({
      filter: {
        sourceFile: {
          size: { min: 10, max: 900533317 },
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
  });
  test('list documents, limit to 2', async () => {
    const response = await client.documents.list({ limit: 2 });
    expect(response.items).toHaveLength(2);
  });
  test('search documents, limit to 1', async () => {
    const response = await client.documents.search({
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0].item).toBeDefined();
    expect(response.items[0].item.id).toBeDefined();
  });

  describe('document preview', () => {
    let documents: ListResponse<Document[]>;

    beforeAll(async () => {
      const mediaTypePDF = 'application/pdf';
      documents = await client.documents.list({
        limit: 1,
        filter: { mimeType: { equals: mediaTypePDF } },
      });
    });

    test('fetch image preview', async () => {
      if (documents.items.length == 0) {
        return;
      }
      const document = documents.items[0];

      await client.documents.preview.documentAsImage(document.id, 0);
    });
    test('fetch pdf preview', async () => {
      if (documents.items.length == 0) {
        return;
      }
      const document = documents.items[0];

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
      const document = documents.items[0];

      const resp = await client.documents.preview.temporaryLink(document.id);
      expect(resp.temporaryLink).toBeDefined();
    });
  });
});
