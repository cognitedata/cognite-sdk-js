// Copyright 2020 Cognite AS

import {
  mockBaseUrl,
  project,
} from '@cognite/sdk-core/src/__tests__/testUtils';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { setupMockableClient } from '../testUtils';

const baseUrl = `${mockBaseUrl}/api/playground/projects/${project}`;

describe('Documents unit test', () => {
  let client: CogniteClientPlayground;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('url', async () => {
    nock(`${mockBaseUrl}/api/playground/project/`)
      .post(/\/documents\/search/, {
        search: {
          query: 'test',
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({ search: { query: 'test' } });
  });

  test('search with query', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/search/, {
        search: {
          query: 'test',
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
    });
  });

  describe('pipeline', () => {
    test('create pipeline configuration', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/pipelines/, {
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
                  title: ['TERMS'],
                  sourceFile: {
                    name: ['TERMS'],
                    content: ['TERMS'],
                    directory: ['DIRECTORIES'],
                  },
                },
                sensitiveSecurityCategory: 345341343656745,
                restrictToSources: ['my source'],
              },
              classifier: {
                name: 'DOCTYPE',
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
              title: ['TERMS'],
              sourceFile: {
                name: ['TERMS'],
                content: ['TERMS'],
                directory: ['DIRECTORIES'],
              },
            },
            sensitiveSecurityCategory: 345341343656745,
            restrictToSources: ['my source'],
          },
          classifier: {
            name: 'DOCTYPE',
            trainingLabels: [{ externalId: 'string' }],
          },
        },
      ]);
    });
    test('create pipeline configuration', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/pipelines/, {
          items: [
            {
              externalId: 'cognitesdk-js-test',
              sensitivityMatcher: {
                matchLists: {},
                fieldMappings: {},
              },
              classifier: {
                trainingLabels: [],
              },
            },
          ],
        })
        .once()
        .reply(200, {
          items: [
            {
              externalId: 'cognitesdk-js-test',
              sensitivityMatcher: {
                matchLists: {},
                fieldMappings: {
                  sourceFile: {},
                },
                restrictToSources: [],
                filterPasswords: true,
              },
              classifier: {
                trainingLabels: [],
              },
            },
          ],
        });
      const resp = await client.documents.pipelines.create([
        {
          externalId: 'cognitesdk-js-test',
          sensitivityMatcher: {
            matchLists: {},
            fieldMappings: {},
          },
          classifier: {
            trainingLabels: [],
          },
        },
      ]);

      expect(resp).toHaveLength(1);
      expect(resp[0].externalId).toEqual('cognitesdk-js-test');
    });

    test('get pipeline configuration', async () => {
      nock(mockBaseUrl)
        .get(/\/documents\/pipelines/)
        .once()
        .reply(200, {});
      await client.documents.pipelines.list();
    });

    test('update pipeline configuration', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/pipelines/, {
          items: [
            {
              externalId: 'cognitesdk-js-test',
              update: {
                sensitivityMatcher: {
                  modify: {
                    matchLists: {
                      set: {
                        restrictToSources: [],
                      },
                    },
                    fieldMappings: {
                      set: {
                        title: ['dsfsdf'],
                      },
                    },
                    filterPasswords: {
                      set: true,
                    },
                  },
                },
                classifier: {
                  modify: {
                    name: {
                      set: 'UPDATED',
                    },
                    trainingLabels: {
                      remove: [{ externalId: 'wrong-id' }],
                    },
                    activeClassifierId: {
                      setNull: true,
                    },
                  },
                },
              },
            },
          ],
        })
        .once()
        .reply(200, { items: [] });
      await client.documents.pipelines.update([
        {
          externalId: 'cognitesdk-js-test',
          update: {
            sensitivityMatcher: {
              modify: {
                matchLists: {
                  set: {
                    restrictToSources: [],
                  },
                },
                fieldMappings: {
                  set: {
                    title: ['dsfsdf'],
                  },
                },
                filterPasswords: {
                  set: true,
                },
              },
            },
            classifier: {
              modify: {
                name: {
                  set: 'UPDATED',
                },
                trainingLabels: {
                  remove: [{ externalId: 'wrong-id' }],
                },
                activeClassifierId: {
                  setNull: true,
                },
              },
            },
          },
        },
      ]);
    });

    test('delete pipeline configuration', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/pipelines\/delete/, {
          items: [{ externalId: 'test' }],
        })
        .once()
        .reply(200, {});
      await client.documents.pipelines.delete([{ externalId: 'test' }]);
    });
  });
  test('document content', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/content/, {
        items: [{ id: 1 }, { id: 2 }, { id: 7 }],
      })
      .once()
      .reply(200, {
        items: [
          { id: 1, content: 'lorem ipsum' },
          { id: 2, content: 'lorem ipsum ted' },
          { id: 7, content: 'lorem ipsum vismysa antom' },
        ],
      });
    const resp = await client.documents.content([1, 2, 7]);

    expect(resp.items).toHaveLength(3);
    expect(resp.items[0].id).toEqual(1);
    expect(resp.items[0].content).toEqual('lorem ipsum');
  });
  test('document content, with unknown ids', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/content/, {
        items: [{ id: 1 }, { id: 2 }, { id: 7 }],
        ignoreUnknownIds: true,
      })
      .once()
      .reply(200, {
        items: [{ id: 1, content: 'lorem ipsum' }],
      });
    const resp = await client.documents.content([1, 2, 7], true);

    expect(resp.items).toHaveLength(1);
    expect(resp.items[0].id).toEqual(1);
    expect(resp.items[0].content).toEqual('lorem ipsum');
  });

  describe('geo location', () => {
    test('point', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/search/, {})
        .once()
        .reply(200, {
          items: [
            {
              item: {
                geoLocation: {
                  type: 'Point',
                  coordinates: [2.324, 23.1],
                },
              },
            },
          ],
        });
      const response = await client.documents.search({});
      const geoLocation = response.items[0].item.geoLocation;
      expect(geoLocation?.type).toEqual('Point');
      expect(geoLocation?.coordinates).toBeDefined();
      // @ts-ignore
      expect(geoLocation?.coordinates[0]).toEqual(2.324);
      // @ts-ignore
      expect(geoLocation?.coordinates[1]).toEqual(23.1);
    });

    test('MultiPoint / LineString', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/search/, {})
        .once()
        .reply(200, {
          items: [
            {
              item: {
                geoLocation: {
                  type: 'MultiPoint',
                  coordinates: [
                    [2.324, 23.1],
                    [2, 7],
                  ],
                },
              },
            },
          ],
        });
      const response = await client.documents.search({});
      const geoLocation = response.items[0].item.geoLocation;
      expect(geoLocation?.type).toEqual('MultiPoint');
      expect(geoLocation?.coordinates).toBeDefined();
      // @ts-ignore
      expect(geoLocation?.coordinates[0]).toEqual([2.324, 23.1]);
      // @ts-ignore
      expect(geoLocation?.coordinates[1]).toEqual([2, 7]);
    });

    test('MultiLineString', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/search/, {})
        .once()
        .reply(200, {
          items: [
            {
              item: {
                geoLocation: {
                  type: 'MultiLineString',
                  coordinates: [
                    [
                      [2.324, 23.1],
                      [2, 7],
                    ],
                    [
                      [3, 4],
                      [2, 1],
                    ],
                  ],
                },
              },
            },
          ],
        });
      const response = await client.documents.search({});
      const geoLocation = response.items[0].item.geoLocation;
      expect(geoLocation?.type).toEqual('MultiLineString');
      expect(geoLocation?.coordinates).toBeDefined();
      // @ts-ignore
      expect(geoLocation?.coordinates[0]).toEqual([
        [2.324, 23.1],
        [2, 7],
      ]);
      // @ts-ignore
      expect(geoLocation?.coordinates[1]).toEqual([
        [3, 4],
        [2, 1],
      ]);
    });

    test('MultiPolygon', async () => {
      nock(mockBaseUrl)
        .post(/\/documents\/search/, {})
        .once()
        .reply(200, {
          items: [
            {
              item: {
                geoLocation: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [40.0, 40.0],
                        [20.0, 45.0],
                        [45.0, 30.0],
                        [40.0, 40.0],
                      ],
                    ],
                    [
                      [
                        [20.0, 35.0],
                        [10.0, 30.0],
                        [10.0, 10.0],
                        [30.0, 5.0],
                        [45.0, 20.0],
                        [20.0, 35.0],
                      ],
                      [
                        [30.0, 20.0],
                        [20.0, 15.0],
                        [20.0, 25.0],
                        [30.0, 20.0],
                      ],
                    ],
                  ],
                },
              },
            },
          ],
        });
      const response = await client.documents.search({});
      const geoLocation = response.items[0].item.geoLocation;
      expect(geoLocation?.type).toEqual('MultiPolygon');
      expect(geoLocation?.coordinates).toBeDefined();
      // @ts-ignore
      const polygon1 = geoLocation?.coordinates[0];
      // @ts-ignore
      const polygon2 = geoLocation?.coordinates[1];
      // @ts-ignore
      expect(polygon1[0][0][0]).toEqual(40.0);
      // @ts-ignore
      expect(polygon2[0][0][0]).toEqual(20.0);
      // @ts-ignore
      expect(polygon2[1]).toEqual([
        [30.0, 20.0],
        [20.0, 15.0],
        [20.0, 25.0],
        [30.0, 20.0],
      ]);
    });

    describe('geometry collections', () => {
      test('Point & LineString', async () => {
        nock(mockBaseUrl)
          .post(/\/documents\/search/, {})
          .once()
          .reply(200, {
            items: [
              {
                item: {
                  geoLocation: {
                    type: 'GeometryCollection',
                    geometries: [
                      {
                        type: 'LineString',
                        coordinates: [
                          [2.324, 23.1],
                          [2, 7],
                        ],
                      },
                      {
                        type: 'Point',
                        coordinates: [2.324, 23.1],
                      },
                    ],
                  },
                },
              },
            ],
          });
        const response = await client.documents.search({});
        const geoLocation = response.items[0].item.geoLocation;
        expect(geoLocation?.type).toEqual('GeometryCollection');
        expect(geoLocation?.coordinates).toBeUndefined();
        expect(geoLocation?.geometries).toBeDefined();

        // @ts-ignore
        const first = geoLocation?.geometries[0];
        // @ts-ignore
        const second = geoLocation?.geometries[1];

        expect(first?.type).toEqual('LineString');
        expect(first?.coordinates).toEqual([
          [2.324, 23.1],
          [2, 7],
        ]);

        expect(second?.type).toEqual('Point');
        expect(second?.coordinates).toEqual([2.324, 23.1]);
      });
    });
  });

  test('search with filter', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/search/, {
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
      .post(/\/documents\/list/, {
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

  test('filter documents by page count', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/list/, {
        filter: {
          pageCount: {
            min: 3,
            max: 10,
          },
        },
        limit: 5,
      })
      .once()
      .reply(200, {});
    await client.documents.list({
      filter: { pageCount: { min: 3, max: 10 } },
      limit: 5,
    });
  });

  test('search with size range', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/search/, {
        search: {
          query: 'test',
        },
        filter: {
          sourceFile: {
            size: {
              min: 1,
              max: 10,
            },
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: {
        sourceFile: {
          size: { min: 1, max: 10 },
        },
      },
    });
  });

  test('search with asset subtree filter', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/search/, {
        search: {
          query: 'test',
        },
        filter: {
          sourceFile: {
            assetSubtreeIds: { containsAny: [3, 5, 1] },
          },
          assetSubtreeIds: { containsAny: [3, 5, 1] },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: {
        sourceFile: {
          assetSubtreeIds: { containsAny: [3, 5, 1] },
        },
        assetSubtreeIds: { containsAny: [3, 5, 1] },
      },
    });
  });

  test('create feedback on document', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/feedback/, {
        items: [
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test-2',
            },
            action: 'ATTACH',
          },
        ],
      })
      .once()
      .reply(200, {
        items: [
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test-2',
            },
            action: 'ATTACH',
            feedbackId: 2,
            createdAt: '2021-08-10T17:54:27.932608',
            status: 'CREATED',
          },
        ],
      });
    const response = await client.documents.feedback.create([
      {
        documentId: 1731129751740,
        label: {
          externalId: 'cognitesdk-js-documents-feedback-test-2',
        },
        action: 'ATTACH',
      },
    ]);
    expect(response[0].status).toEqual('CREATED');
  });

  test('list feedback', async () => {
    nock(mockBaseUrl)
      .get(/\/documents\/feedback/)
      .query({ status: 'CREATED' })
      .once()
      .reply(200, {
        items: [
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test',
            },
            action: 'ATTACH',
            feedbackId: 1,
            createdAt: '2021-08-10T17:54:27.932608',
            reviewedAt: '2021-08-10T17:59:57.804811',
            status: 'CREATED',
          },
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test-2',
            },
            action: 'ATTACH',
            feedbackId: 2,
            createdAt: '2021-08-10T17:54:27.932608',
            reviewedAt: '2021-08-10T17:59:57.804811',
            status: 'ACCEPTED',
          },
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test-3',
            },
            action: 'ATTACH',
            feedbackId: 3,
            createdAt: '2021-08-10T17:54:27.932608',
            reviewedAt: '2021-08-10T17:59:57.804811',
            status: 'REJECTED',
          },
        ],
      });
    await client.documents.feedback.list('CREATED');
  });

  test('aggregate feedbacks by field', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/feedback\/aggregates/, {
        field: 'action',
      })
      .once()
      .reply(200, {});
    await client.documents.feedback.aggregates('action');
  });

  test('accept feedbacks', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/feedback\/accept/, {
        items: [{ id: 1 }, { id: 3 }],
      })
      .once()
      .reply(200, {
        items: [
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test',
            },
            action: 'ATTACH',
            feedbackId: 1,
            createdAt: '2021-08-10T17:54:27.932608',
            reviewedAt: '2021-08-10T17:59:57.804811',
            status: 'ACCEPTED',
          },
          {
            documentId: 1731129751740,
            label: {
              externalId: 'cognitesdk-js-documents-feedback-test-2',
            },
            action: 'ATTACH',
            feedbackId: 3,
            createdAt: '2021-08-10T17:54:27.932608',
            reviewedAt: '2021-08-10T17:59:57.804811',
            status: 'ACCEPTED',
          },
        ],
      });
    await client.documents.feedback.accept([1, 3]);
  });

  test('reject feedbacks', async () => {
    nock(mockBaseUrl)
      .post(/\/documents\/feedback\/reject/, {
        items: [{ id: 1 }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.reject([1]);
  });

  test('document preview uri', async () => {
    const base = (path: string): string => {
      return `/api/playground/projects/${project}/documents${path}`;
    };

    const preview = client.documents.preview;
    expect(preview.buildPreviewURI(1, 'image/png')).toEqual(
      base('/preview/?documentId=1&page=0')
    );
    expect(preview.buildPreviewURI(4, 'application/pdf')).toEqual(
      base('/preview/?documentId=4')
    );
    expect(preview.buildPreviewURI(4, 'image/png')).toEqual(
      base('/preview/?documentId=4&page=0')
    );
    expect(preview.buildPreviewURI(4, 'image/png', 2)).toEqual(
      base('/preview/?documentId=4&page=2')
    );
  });

  test('document preview pdf', async () => {
    nock(mockBaseUrl)
      .get(/\/documents\/preview/)
      .matchHeader('Accept', 'application/pdf')
      .query({ documentId: 1 })
      .once()
      .reply(200);
    await client.documents.preview.documentAsPdf(1);
  });

  test('document preview image', async () => {
    nock(mockBaseUrl)
      .get(/\/documents\/preview/)
      .matchHeader('Accept', 'image/png')
      .query({ documentId: 1, page: 0 })
      .once()
      .reply(200);
    await client.documents.preview.documentAsImage(1, 0);
  });

  test('document preview temporary link', async () => {
    const link = 'just-testing';
    nock(mockBaseUrl)
      .get(/\/documents\/preview\/temporaryLink/)
      .query({ documentId: 1 })
      .once()
      .reply(200, { temporaryLink: link });
    const resp = await client.documents.preview.temporaryLink(1);
    expect(resp.temporaryLink).toEqual(link);
  });

  describe('classifiers', () => {
    test('create', async () => {
      nock(baseUrl)
        .post('/documents/classifiers', {
          items: [{ name: 'test' }],
        })
        .once()
        .reply(200, {
          items: [{ name: 'test' }],
        });
      const resp = await client.documents.classifiers.create([
        { name: 'test' },
      ]);
      expect(resp[0].name).toEqual('test');
    });
    test('list by ids', async () => {
      nock(baseUrl)
        .post('/documents/classifiers/byids', {
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
          ignoreUnknownIds: false,
        })
        .once()
        .reply(200, {
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        });
      const resp = await client.documents.classifiers.listByIds([1, 2, 3]);
      expect(resp.items[0].id).toEqual(1);
    });
    test('list by ids, ignore unknown', async () => {
      nock(baseUrl)
        .post('/documents/classifiers/byids', {
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
          ignoreUnknownIds: true,
        })
        .once()
        .reply(200, {
          items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        });
      const resp = await client.documents.classifiers.listByIds(
        [1, 2, 3],
        true
      );
      expect(resp.items[0].id).toEqual(1);
    });
  });
});
