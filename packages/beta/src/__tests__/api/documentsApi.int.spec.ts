// Copyright 2020 Cognite AS

import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe.skip('documents api', () => {
  let client: CogniteClient;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('list documents', async () => {
    const response = await client.documents.list();
    console.log(response.items);
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('list documents, limit to 1', async () => {
    const response = await client.documents.list({ limit: 1 });
    expect(response.items.length).toEqual(1);
  });
  test('list documents, by size', async () => {
    const response = await client.documents.list({
      filter: { size: { min: 10, max: 900533317 } },
      limit: 1,
    });
    expect(response.items.length).toEqual(1);
  });
  test('list documents feedback', async () => {
    const response = await client.documents.feedback.list('CREATED');
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('list pipeline configurations', async () => {
    const response = await client.documents.pipelines.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  test('fetch preview', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    expect(documents.items.length).toEqual(1);
    const document = documents.items[0];

    await client.documents.preview.document(document.id, mediaTypePDF);
    await client.documents.preview.documentAsPdf(document.id);
    await client.documents.preview.documentAsImage(document.id, 0);
  });
});
