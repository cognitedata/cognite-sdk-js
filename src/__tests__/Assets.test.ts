// Copyright 2018 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { Asset, Assets, instance } from '../index';
import * as sdk from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
  sdk.configure({
    project: '',
  });
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const assets: Asset[] = [
  {
    id: 7452046244527787,
    path: [7452046244527787],
    depth: 0,
    name: 'Asset name',
    createdTime: 1540219761273,
    lastUpdatedTime: 1540219761273,
  },
  {
    id: 5468582198825366,
    path: [7452046244527787, 5468582198825366],
    depth: 1,
    name: 'Sub asset',
    parentId: 7452046244527787,
    createdTime: 1540220671466,
    lastUpdatedTime: 1540220671466,
  },
  {
    id: 5215319849298559,
    path: [7452046244527787, 5468582198825366, 5215319849298559],
    depth: 2,
    name: 'Sub asset 2',
    parentId: 5468582198825366,
    createdTime: 1540220671466,
    lastUpdatedTime: 1540220671466,
  },
];

const requestAssets: Partial<Asset>[] = [
  { name: assets[0].name },
  {
    name: 'Sub asset',
    parentId: 7452046244527787,
  },
  {
    name: 'Sub asset 2',
    parentName: 'Sub asset',
  },
];

describe('Assets', () => {
  test('create root assets', async () => {
    mock
      .onPost(/\/assets$/, {
        items: [requestAssets[0]],
      })
      .reply(200, {
        data: {
          items: [assets[0]],
        },
      });
    const result = await Assets.create([requestAssets[0]]);
    expect(result).toEqual([assets[0]]);
  });

  test('create sub asset', async () => {
    mock
      .onPost(/\/assets$/, {
        items: requestAssets.slice(1),
      })
      .reply(200, {
        data: {
          items: [assets[1], assets[2]],
        },
      });

    const result = await Assets.create(requestAssets.slice(1));
    expect(result).toEqual(assets.slice(1));
  });

  test('retrive asset', async () => {
    const url = new RegExp(`/assets/${assets[2].id}$`);
    mock.onGet(url).reply(200, {
      data: {
        items: [assets[2]],
      },
    });

    const result = await Assets.retrieve(assets[2].id);
    expect(result).toEqual(assets[2]);
  });

  test('retrive multiple assets', async () => {
    mock
      .onPost(/\/assets\/byids$/, {
        items: [assets[1].id, assets[2].id],
      })
      .reply(200, {
        data: {
          items: [assets[1], assets[2]],
        },
      });
    const result = await Assets.retrieveMultiple([assets[1].id, assets[2].id]);
    expect(result).toEqual(assets.slice(1));
  });

  test('update asset', async () => {
    const newDescription = 'New description';
    const changes = {
      description: {
        set: newDescription,
      },
    };

    const reg = new RegExp(`/assets/${assets[0].id}/update$`);
    mock
      .onPost(reg, {
        ...changes,
      })
      .reply(200, {
        data: {
          items: [
            {
              ...assets[0],
              description: newDescription,
            },
          ],
        },
      });

    const result = await Assets.update(assets[0].id as number, changes);
    expect(result).toEqual({
      ...assets[0],
      description: newDescription,
    });
  });

  test('update multiple assets', async () => {
    const newDescription = 'New description';
    const changes = [
      {
        id: assets[0].id,
        description: {
          set: newDescription,
        },
      },
      {
        id: assets[1].id,
        description: {
          setNull: true,
        },
      },
    ];
    mock
      .onPost(/\/assets\/update$/, {
        items: changes,
      })
      .reply(200, {
        data: {
          items: [
            {
              ...assets[0],
              description: newDescription,
            },
            {
              ...assets[1],
            },
          ],
        },
      });

    const result = await Assets.updateMultiple(changes);
    const expectedResult = [
      {
        ...assets[0],
        description: newDescription,
      },
      {
        ...assets[1],
      },
    ];
    expect(result).toEqual(expectedResult);
  });

  test('overwrite multiple assets', async () => {
    mock
      .onPut(/\/assets$/, {
        items: assets,
      })
      .reply(200, {});

    await Assets.overwriteMultiple(assets);
  });

  test('list assets', async () => {
    const params = {
      depth: 12,
      limit: 1,
      fuzziness: 3,
      path: '123/456',
      metadata: { abc: 'def' },
      description: 'Description',
      source: 'src',
      cursor: 'XSelw3Cw1bTwNUmFRITOmGy0HIOdsgz_fBw1WagOmmbLK07KPY4o-',
    };

    const previousCursor =
      'AihsEiVik5ZuAKeemGKMfGfRndMNkXusZTv-Fz-5pqZ6nGWBGXAYa84_ydD';
    const nextCursor = 'AWL1GdOlhdZJzNTvbNLA9UhYFm05DIGla2WUW-GCyQPa14';
    mock
      .onGet(/\/assets$/, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: assets,
        },
      });

    const result = await Assets.list(params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: assets,
    });
  });

  test('list descendants assets', async () => {
    const reg = new RegExp(`/assets/${assets[0].id}/subtree$`);
    const params = {
      depth: 2,
      cursor: 'X4BZC06qUImev88ggdAobDHfyx9pz0THeOunBlc9IsA',
      limit: 1,
    };
    const previousCursor =
      'AihsEiVik5ZuAKeemGKMXaRGfRndMNkXusZTv-Fz-5pqZ6nGWBGXAYa84_ydD';
    const nextCursor =
      'AWL1GdOlhdZJzNTvbNLAoHP9UMNwLK_GOTSim05DIGla2WUW-GCyQPa14';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: [assets[0]],
        },
      });

    const result = await Assets.listDescendants(assets[0].id as number, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: [assets[0]],
    });
  });

  test('search assets', async () => {
    const params = {
      metadata: { key1: 'value1' },
      assetSubtrees: [assets[0].id],
    };
    mock
      .onGet(/\/assets\/search$/, {
        params,
      })
      .reply(200, {
        data: {
          items: [assets[1]],
        },
      });

    const result = await Assets.search(params);
    expect(result).toEqual({ items: [assets[1]] });
  });

  test('delete assets', async () => {
    mock
      .onPost(/\/assets\/delete$/, {
        items: [assets[0].id, assets[1].id],
      })
      .reply(200, {});
    await Assets.delete([assets[0].id as number, assets[1].id as number]);
  });
});
