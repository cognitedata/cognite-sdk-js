// Copyright 2022 Cognite AS

import nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';

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
      // @ts-ignore
      expect(geoLocation?.coordinates[0]).toEqual(2.324);
      // @ts-ignore
      expect(geoLocation?.coordinates[1]).toEqual(23.1);
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
      // @ts-ignore
      expect(geoLocation?.coordinates[0]).toEqual([2.324, 23.1]);
      // @ts-ignore
      expect(geoLocation?.coordinates[1]).toEqual([2, 7]);
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
        .post(new RegExp('/documents/search'), {})
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
});
