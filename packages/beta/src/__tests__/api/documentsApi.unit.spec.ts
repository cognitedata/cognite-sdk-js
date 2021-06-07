// Copyright 2020 Cognite AS

import nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '@cognite/sdk-core/src/testUtils';

describe('Documents unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('search with query', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({ search: { query: 'test' } });
  });

  test('search with filter', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
        filter: {
          type: {
            equals: 'PDF',
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: { type: { equals: 'PDF' } },
    });
  });

  test('filter documents', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/list'), {
        filter: {
          author: {
            in: ['test1', 'test2'],
          },
        },
        limit: 5,
      })
      .once()
      .reply(200, {});
    await client.documents.list({
      filter: { author: { in: ['test1', 'test2'] } },
      limit: 5,
    });
  });

  test('create pipeline configuration', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/pipelines'), {
        items: [
          {
            externalId: 'default',
            sensitivityMatcher: {
              matchLists: {
                DIRECTORIES: ['secret'],
                TYPES: ['contracts', 'emails'],
                TERMS: ['secret', 'confidential', 'sensitive'],
              },
              fieldMappings: {
                title: 'TERMS',
                sourceFile: {
                  name: 'TERMS',
                  content: 'TERMS',
                  directory: 'DIRECTORIES',
                },
              },
              sensitiveSecurityCategory: 345341343656745,
              restrictToSources: ['my source'],
            },
            classifier: {
              trainingLabels: [
                {
                  externalId: 'string',
                },
              ],
            },
          },
        ],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.pipelines.create([
      {
        externalId: 'default',
        sensitivityMatcher: {
          matchLists: {
            DIRECTORIES: ['secret'],
            TYPES: ['contracts', 'emails'],
            TERMS: ['secret', 'confidential', 'sensitive'],
          },
          fieldMappings: {
            title: 'TERMS',
            sourceFile: {
              name: 'TERMS',
              content: 'TERMS',
              directory: 'DIRECTORIES',
            },
          },
          sensitiveSecurityCategory: 345341343656745,
          restrictToSources: ['my source'],
        },
        classifier: {
          trainingLabels: [{ externalId: 'string' }],
        },
      },
    ]);
  });

  test('get pipeline configuration', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/pipelines'))
      .once()
      .reply(200, {});
    await client.documents.pipelines.list();
  });

  test('update pipeline configuration', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/pipelines'), {
        items: [{ externalId: 'test' }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.pipelines.update([
      {
        externalId: 'test',
      },
    ]);
  });

  test('delete pipeline configuration', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/pipelines/delete'), {
        items: [{ externalId: 'test' }],
      })
      .once()
      .reply(200, {});
    await client.documents.pipelines.delete([{ externalId: 'test' }]);
  });

  test('create feedback on document', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback'), {
        items: [
          {
            documentId: 1,
            label: { externalId: '2' },
            action: 'ATTACH',
          },
        ],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.create([
      {
        documentId: 1,
        label: { externalId: '2' },
        action: 'ATTACH',
      },
    ]);
  });

  test('list feedback', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/feedback'))
      .query({ status: 'CREATED' })
      .once()
      .reply(200, {});
    await client.documents.feedback.list('CREATED');
  });

  test('aggregate feedbacks by field', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/aggregates'), {
        field: 'action',
      })
      .once()
      .reply(200, {});
    await client.documents.feedback.aggregates('action');
  });

  test('accept feedbacks', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/accept'), {
        items: [{ id: 1 }, { id: 3 }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.accept([{ id: 1 }, { id: 3 }]);
  });

  test('reject feedbacks', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/reject'), {
        items: [{ id: 1 }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.reject([{ id: 1 }]);
  });

  test('document preview', async () => {
    nock(mockBaseUrl)
      .get('/documents/preview').query({"documentId": 1, "page": 0})
      .once()
      .reply(200);
    await client.documents.preview.document(1);
  });

  test('document preview temporary link', async () => {
    let link = "just-testing"
    nock(mockBaseUrl)
      .get('/documents/preview/temporaryLink').query({"documentId": 1})
      .once()
      .reply(200, {"temporaryLink": link});
    let t = nock.pendingMocks()
    t.pop()
    let resp = await client.documents.preview.temporaryLink(1);
    expect(resp.temporaryLink).toEqual(link)
  });
});
