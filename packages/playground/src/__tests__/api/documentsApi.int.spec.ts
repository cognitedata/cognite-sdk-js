// Copyright 2020 Cognite AS

import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient } from '../testUtils';

expect.extend({
  toEqual(received, expected) {
    return {
      message: () => `Got ${received}, wanted ${expected}`,
      pass: false,
    };
  },
});

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

  test('fetch image preview', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    await client.documents.preview.documentAsImage(document.id, 0);
  });
  test('fetch pdf preview', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    const resp = await client.documents.preview.documentAsPdf(document.id);

    const pdfPrefix = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
    expect(resp.byteLength).toBeGreaterThan(pdfPrefix.length);
    const frontSlice = resp.slice(0, pdfPrefix.length);
    expect(frontSlice.byteLength).toStrictEqual(pdfPrefix.length);
    const match = Buffer.from(frontSlice, 0).equals(Buffer.from(pdfPrefix, 0));
    expect(match).toBe(true);
  });
  test('fetch temporary link', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    const resp = await client.documents.preview.temporaryLink(document.id);
    expect(resp.temporaryLink).toBeDefined();
  });
});
