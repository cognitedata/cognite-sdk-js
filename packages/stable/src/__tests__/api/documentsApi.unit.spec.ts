// Copyright 2022 Cognite AS

import nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

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
    await client.documents.search({
      search: { query: 'test' },
    });
  });

  describe('geo location', () => {
    test('point', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/documents/search'), {})
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
      expect(geoLocation?.coordinates![0]).toEqual(2.324);
      expect(geoLocation?.coordinates![1]).toEqual(23.1);
    });

    test('MultiPoint / LineString', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/documents/search'), {})
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
      expect(geoLocation?.coordinates![0]).toEqual([2.324, 23.1]);
      expect(geoLocation?.coordinates![1]).toEqual([2, 7]);
    });

    test('MultiLineString', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/documents/search'), {})
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
      expect(geoLocation?.coordinates![0]).toEqual([
        [2.324, 23.1],
        [2, 7],
      ]);
      expect(geoLocation?.coordinates![1]).toEqual([
        [3, 4],
        [2, 1],
      ]);
    });

    test('MultiPolygon', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/documents/search'), {})
        .once()
        .reply(200, {
          items: [
            {
              item: {
                geoLocation: {
                  type: 'MultiPolygon',
                  coordinates: [10, 20],
                },
              },
            },
          ],
        });
      const response = await client.documents.search({});
      const geoLocation = response.items[0].item.geoLocation;
      expect(geoLocation?.type).toEqual('MultiPolygon');
      expect(geoLocation?.coordinates).toBeDefined();
      const polygon1 = geoLocation?.coordinates![0];
      const polygon2 = geoLocation?.coordinates![1];
      expect(polygon1).toEqual(10.0);
      expect(polygon2).toEqual(20.0);
    });

    describe('geometry collections', () => {
      test('Point & LineString', async () => {
        nock(mockBaseUrl)
          .post(new RegExp('/documents/search'), {})
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

        const first = geoLocation?.geometries![0];
        const second = geoLocation?.geometries![1];

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
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
        filter: {
          equals: {
            property: ['type'],
            value: 'PDF',
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: {
        equals: {
          property: ['type'],
          value: 'PDF',
        },
      },
    });
  });

  test('search with size range', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
        filter: {
          range: {
            property: ['sourceFile', 'size'],
            gte: 1,
            lte: 10,
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: {
        range: {
          property: ['sourceFile', 'size'],
          gte: 1,
          lte: 10,
        },
      },
    });
  });

  test('document pdf preview uri', async () => {
    const base = (path: string): string => {
      return `/api/v1/projects/${client.project}/documents${path}`;
    };

    const preview = client.documents.preview;
    expect(preview.pdfBuildPreviewURI(1)).toEqual(base('/1/preview/pdf'));
    expect(preview.pdfBuildPreviewURI(4)).toEqual(base('/4/preview/pdf'));
  });

  test('document image preview uri', async () => {
    const base = (path: string): string => {
      return `/api/v1/projects/${client.project}/documents${path}`;
    };

    const preview = client.documents.preview;
    expect(preview.imageBuildPreviewURI(1)).toEqual(
      base('/1/preview/image/pages/1')
    );
    expect(preview.imageBuildPreviewURI(1, 4)).toEqual(
      base('/1/preview/image/pages/4')
    );
  });

  test('document pdf temporary link uri', async () => {
    const base = (path: string): string => {
      return `/api/v1/projects/${client.project}/documents${path}`;
    };

    const preview = client.documents.preview;
    expect(preview.pdfBuildTemporaryLinkURI(1)).toEqual(
      base('/1/preview/pdf/temporarylink')
    );
    expect(preview.pdfBuildTemporaryLinkURI(4)).toEqual(
      base('/4/preview/pdf/temporarylink')
    );
  });

  test('document preview pdf', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/1/preview/pdf'))
      .matchHeader('Accept', 'application/pdf')
      .once()
      .reply(200);
    await client.documents.preview.documentAsPdf(1);
  });

  test('document preview image', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/1/preview/image/pages/1'))
      .matchHeader('Accept', 'image/png')
      .once()
      .reply(200);
    await client.documents.preview.documentAsImage(1, 1);
  });

  test('document preview pdf temporary link', async () => {
    const link = 'just-testing';
    const expirationTime = 1519862400000;
    nock(mockBaseUrl)
      .get(new RegExp('/documents/1/preview/pdf/temporarylink'))
      .once()
      .reply(200, { temporaryLink: link, expirationTime: expirationTime });
    const resp = await client.documents.preview.pdfTemporaryLink(1);
    expect(resp.temporaryLink).toEqual(link);
    expect(resp.expirationTime).toEqual(expirationTime);
  });

  test('document content', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/5/content'))
      .matchHeader('accept', 'text/plain')
      .once()
      .reply(200, 'lorem ipsum');

    const content = await client.documents.content(5);
    expect(content).toEqual('lorem ipsum');
  });

  test('document list', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/list'), {
        limit: 5,
        filter: {
          equals: {
            property: ['type'],
            value: 'PDF',
          },
        },
      })
      .once()
      .reply(200, {
        items: [{ id: 3456 }],
      });

    const resp = await client.documents.list({
      limit: 5,
      filter: {
        equals: {
          property: ['type'],
          value: 'PDF',
        },
      },
    });
    expect(resp.items).toHaveLength(1);
    expect(resp.items[0]).toEqual({ id: 3456 });
  });

  test('document aggregate count', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        filter: {
          equals: {
            property: ['sourceFile', 'name'],
            value: 'PDF',
          },
        },
        aggregate: 'count',
      })
      .once()
      .reply(200, {
        items: [{ count: 3456 }],
      });

    const resp = await client.documents.aggregate.count({
      filter: {
        equals: {
          property: ['sourceFile', 'name'],
          value: 'PDF',
        },
      },
    });
    expect(resp).toBe(3456);
  });

  test('document aggregate uniqueValues', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'uniqueValues',
        properties: [{ property: ['extension'] }],
      })
      .once()
      .reply(200, {
        items: [
          { count: 12, values: ['txt'] },
          { count: 55, values: ['pdf'] },
        ],
      });

    const resp = await client.documents.aggregate.uniqueValues({
      properties: [{ property: ['extension'] }],
    });
    expect(resp).toStrictEqual([
      { count: 12, values: ['txt'] },
      { count: 55, values: ['pdf'] },
    ]);
  });

  test('document aggregate allUniqueValues one page', async () => {
    const nextCursor = 'next-cursor-value';

    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'allUniqueValues',
        properties: [{ property: ['extension'] }],
        limit: 67,
      })
      .once()
      .reply(200, {
        items: [{ count: 12, values: ['txt'] }],
        nextCursor,
      });

    const resp = await client.documents.aggregate.allUniqueValues({
      properties: [{ property: ['extension'] }],
      limit: 67,
    });
    expect(resp).toEqual({
      items: [{ count: 12, values: ['txt'] }],
      next: expect.any(Function),
      nextCursor,
    });
  });

  test('document aggregate uniqueProperties', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'uniqueProperties',
        properties: [{ property: ['metadata'] }],
      })
      .once()
      .reply(200, {
        items: [
          { count: 12, values: ['test'] },
          { count: 55, values: ['description'] },
        ],
      });

    const resp = await client.documents.aggregate.uniqueProperties({
      properties: [{ property: ['metadata'] }],
    });
    expect(resp).toEqual([
      { count: 12, values: ['test'] },
      { count: 55, values: ['description'] },
    ]);
  });

  test('document aggregate allUniqueProperties', async () => {
    const nextCursor = 'next-cursor-value';

    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'allUniqueProperties',
        properties: [{ property: ['metadata'] }],
      })
      .once()
      .reply(200, {
        items: [
          { count: 12, values: ['test'] },
          { count: 55, values: ['description'] },
        ],
        nextCursor,
      });

    const resp = await client.documents.aggregate.allUniqueProperties({
      properties: [{ property: ['metadata'] }],
    });
    expect(resp).toEqual({
      items: [
        { count: 12, values: ['test'] },
        { count: 55, values: ['description'] },
      ],
      next: expect.any(Function),
      nextCursor,
    });
  });

  test('document aggregate allUniqueValues all pages', async () => {
    const firstCursor = 'first-cursor-value';

    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'allUniqueValues',
        properties: [{ property: ['extension'] }],
        limit: 1,
      })
      .once()
      .reply(200, {
        items: [{ count: 12, values: ['txt'] }],
        nextCursor: firstCursor,
      });

    nock(mockBaseUrl)
      .post(new RegExp('/documents/aggregate'), {
        aggregate: 'allUniqueValues',
        properties: [{ property: ['extension'] }],
        limit: 1,
        cursor: firstCursor,
      })
      .once()
      .reply(200, {
        items: [{ count: 44, values: ['pdf'] }],
      });

    const resp = client.documents.aggregate.allUniqueValues({
      properties: [{ property: ['extension'] }],
      limit: 1,
    });

    const items = await resp.autoPagingToArray();

    expect(items).toStrictEqual([
      { count: 12, values: ['txt'] },
      { count: 44, values: ['pdf'] },
    ]);
  });
});
