// Copyright 2020 Cognite AS

import type { ListResponse } from '@cognite/sdk-core';
import type { Document, DocumentFeedback } from '@cognite/sdk-playground';
import { beforeAll, describe, expect, test } from 'vitest';
import { setupLoggedInClient } from '../testUtils';

// TODO: Fix the test
describe.skip('documents api', () => {
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

  test('list pipeline configurations', async () => {
    const response = await client.documents.pipelines.list();
    expect(response.items.length).toBeGreaterThan(0);
  });

  test('document content', async () => {
    const response = await client.documents.list({
      filter: {
        id: {
          equals: 8814046572029990,
        },
      },
      limit: 1,
    });
    expect(response.items[0]).toBeDefined();
    const doc = response.items[0];

    const resp = await client.documents.content([doc.id]);
    expect(resp.items).toBeDefined();
    expect(resp.items).toHaveLength(1);

    const documentContent = resp.items[0];
    expect(documentContent.id).toEqual(doc.id);
    expect(documentContent.content).toContain(doc.truncatedContent);
  });

  test('list with geo location filter', async () => {
    const response = await client.documents.list({
      filter: {
        geoLocation: {
          missing: true,
        },
      },
      limit: 1,
    });
    expect(response.items).toHaveLength(1);
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
      if (documents.items.length === 0) {
        return;
      }
      const document = documents.items[0];

      await client.documents.preview.documentAsImage(document.id, 0);
    });

    test('fetch pdf preview', async () => {
      if (documents.items.length === 0) {
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
      if (documents.items.length === 0) {
        return;
      }
      const document = documents.items[0];

      const resp = await client.documents.preview.temporaryLink(document.id);
      expect(resp.temporaryLink).toBeDefined();
    });
  });

  describe('document feedback', () => {
    const firstFeedback: DocumentFeedback = {
      documentId: 1731129751740,
      label: {
        externalId: 'cognitesdk-js-documents-feedback-test',
      },
      action: 'ATTACH',
      feedbackId: 1,
      createdAt: '2021-08-10T17:47:14.022449',
      status: 'CREATED',
    };
    const secondFeedback: DocumentFeedback = {
      documentId: 1731129751740,
      label: {
        externalId: 'cognitesdk-js-documents-feedback-test-2',
      },
      action: 'ATTACH',
      feedbackId: 2,
      createdAt: '2021-08-10T17:54:27.932608',
      reviewedAt: '2021-08-10T17:59:57.804811',
      status: 'ACCEPTED',
    };

    test('should list two feedbacks', async () => {
      const response = await client.documents.feedback.list();
      expect(response.items.length).toEqual(2);
      expect(response.items[0].feedbackId).toEqual(firstFeedback.feedbackId);
      expect(response.items[1].feedbackId).toEqual(secondFeedback.feedbackId);
    });

    test('should list one feedback when filtering by CREATED', async () => {
      const response = await client.documents.feedback.list('CREATED');
      expect(response.items.length).toEqual(1);
    });

    test('should list no feedback when filtering by REJECTED', async () => {
      const response = await client.documents.feedback.list('REJECTED');
      expect(response.items.length).toEqual(0);
    });

    test('should list one feedback when filtering by ACCEPTED', async () => {
      const response = await client.documents.feedback.list('ACCEPTED');
      expect(response.items.length).toEqual(1);
    });
  });
});
