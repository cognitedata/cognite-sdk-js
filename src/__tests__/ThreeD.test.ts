// Copyright 2018 Cognite AS

import { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { instance, ThreeD } from '../index';

let mock: MockAdapter;

beforeAll(() => {
  mock = new MockAdapter(instance);
});

afterAll(() => {
  mock.restore();
});

afterEach(() => {
  // cleaning up the mess left behind the previous test
  mock.reset();
});

const models = [
  {
    name: 'My Model',
    id: 1000,
    createdTime: 200,
  },
  {
    name: 'My Model 2',
    id: 1234,
    createdTime: 250,
  },
];

const requestModels = [{ name: 'My Model' }, { name: 'My Model 2' }];

const requestRevisions = [
  { fileId: 123 },
  {
    fileId: 456,
    rotation: [0, Math.PI / 2, Math.PI],
    camera: {
      target: [10, 20, 30],
      position: [-10, -20, -30.5],
    },
  },
];

const revisions = [
  {
    id: 321,
    fileId: 123,
    camera: {},
    published: false,
    createdTime: 1000,
    assetMappingCount: 0,
    status: 'Queued',
  },
  {
    id: 654,
    fileId: 456,
    rotation: [0, Math.PI / 2, Math.PI],
    camera: {
      target: [10, 20, 30],
      position: [-10, -20, -30.5],
    },
    published: false,
    createdTime: 1000,
    assetMappingCount: 0,
    status: 'Done',
    thumbnailThreedFileId: 12332233,
    thumbnailURL: 'https://api.cognite.com/3d/thumbnail',
  },
];

const requestAssetMappings = [
  {
    nodeId: 2893,
    assetId: 28923832733,
  },
  {
    nodeId: 173781,
    assetId: 318237309312,
  },
];

const assetMappings = [
  {
    nodeId: 2893,
    assetId: 28923832733,
    treeIndex: 15,
    subtreeSize: 28,
  },
  {
    nodeId: 173781,
    assetId: 318237309312,
    treeIndex: 87,
    subtreeSize: 1,
  },
];

const nodes = [
  {
    id: 123,
    treeIndex: 4,
    parentId: 3481,
    depth: 7,
    name: 'Equipment abc',
    subtreeSize: 13,
    boundingBox: { min: [12, 3, -19], max: [18, 6, 0] },
    sectorId: 1235,
    metadata: {},
  },
  {
    id: 1223,
    treeIndex: 8,
    parentId: 34381,
    depth: 8,
    name: 'Equipment def',
    subtreeSize: 1,
    boundingBox: { min: [12, 3, -19], max: [18, 6, 0] },
    sectorId: 1235,
    metadata: {
      key1: 'value1',
      key2: 'value2',
    },
  },
];

const sectors = [
  {
    id: 12,
    parentId: 3,
    path: '0/3/12',
    depth: 2,
    boundingBox: {
      min: [12, 3, -19],
      max: [18, 6, 0],
    },
    threedFileId: 27823,
    threedFiles: [{ version: 4, fileId: 27823 }],
  },
  {
    id: 18,
    parentId: 5,
    path: '0/3/5/18',
    depth: 3,
    boundingBox: {
      min: [14, 4, -42],
      max: [18, 6, 11],
    },
    threedFileId: 223,
    threedFiles: [{ version: 4, fileId: 223 }],
  },
];

describe('3D', () => {
  test('create asset mappings', async () => {
    const reg = new RegExp(`/3d/models/12345/revisions/6789/mappings$`);
    mock
      .onPost(reg, {
        items: requestAssetMappings,
      })
      .reply(200, {
        data: {
          items: assetMappings,
        },
      });
    const result = await ThreeD.createAssetMappings(
      12345,
      6789,
      requestAssetMappings
    );
    expect(result).toEqual(assetMappings);
  });

  test('create models', async () => {
    mock
      .onPost(/\/3d\/models$/, {
        items: requestModels,
      })
      .reply(200, {
        data: {
          items: models,
        },
      });
    const result = await ThreeD.createModels(
      requestModels.map(model => model.name)
    );
    expect(result).toEqual(models);
  });

  test('create revisions', async () => {
    const reg = new RegExp(`/3d/models/12345/revisions$`);
    mock
      .onPost(reg, {
        items: requestRevisions,
      })
      .reply(200, {
        data: {
          items: revisions,
        },
      });
    const result = await ThreeD.createRevisions(12345, requestRevisions);
    expect(result).toEqual(revisions);
  });

  test('retrieve file', async () => {
    // tslint:disable-next-line:no-empty
    const onProgressFunction = () => {};
    const reg = new RegExp(`/3d/files/12345$`);
    // array buffer
    const arrayBuffer = new ArrayBuffer(100);
    mock.onGet(reg).reply((config: AxiosRequestConfig) => {
      expect(config.responseType).toBe('arraybuffer');
      expect(config.onDownloadProgress).toBe(onProgressFunction);
      return [200, arrayBuffer];
    });
    const result = await ThreeD.retrieveFile(
      12345,
      'arraybuffer',
      onProgressFunction
    );
    expect(result).toBe(arrayBuffer);
  });

  test('retrieve model', async () => {
    const reg = new RegExp(`/3d/models/12345$`);
    mock.onGet(reg).reply(200, {
      data: models[0],
    });
    const result = await ThreeD.retrieveModel(12345);
    expect(result).toEqual(models[0]);
  });

  test('retrieve revisions', async () => {
    const reg = new RegExp(`/3d/models/12345/revisions/6789$`);
    mock.onGet(reg).reply(200, {
      data: revisions[0],
    });
    const result = await ThreeD.retrieveRevision(12345, 6789);
    expect(result).toEqual(revisions[0]);
  });

  test('update models', async () => {
    const updateRequests = [
      { id: 12345, name: 'New name' },
      { id: 54321, name: 'New name 2' },
    ];
    const updatedModels = [
      { id: 12345, name: 'New name', createdTime: 17 },
      { id: 54321, name: 'New name 2', createdTime: 18 },
    ];

    mock
      .onPut(/\/3d\/models$/, {
        items: updateRequests,
      })
      .reply(200, {
        data: {
          items: updatedModels,
        },
      });
    const result = await ThreeD.updateModels(updateRequests);
    expect(result).toEqual(updatedModels);
  });

  test('update revisions', async () => {
    const updateRequests = [
      { id: revisions[0].id, published: true },
      { id: revisions[1].id, rotation: [3, 2, 1] },
    ];
    const updatedRevisions = [
      { ...revisions[0], published: true },
      { ...revisions[0], rotation: [3, 2, 1] },
    ];

    mock
      .onPut(/\/3d\/models\/12345\/revisions$/, {
        items: updateRequests,
      })
      .reply(200, {
        data: {
          items: updatedRevisions,
        },
      });
    const result = await ThreeD.updateRevisions(12345, updateRequests);
    expect(result).toEqual(updatedRevisions);
  });

  test('update revision thumbnail', async () => {
    const reg = new RegExp(`/3d/models/1234/revisions/4567/thumbnail$`);
    mock
      .onPost(reg, {
        fileId: 987,
      })
      .reply(200);
    await ThreeD.updateRevisionThumbnail(1234, 4567, 987);
  });

  test('delete models', async () => {
    const modelIds = [123, 456, 7889];
    const reg = new RegExp(`/3d/models/delete$`);
    mock
      .onPost(reg, {
        items: modelIds,
      })
      .reply(200);
    await ThreeD.deleteModels(modelIds);
  });

  test('delete revisions', async () => {
    const revisionIds = [123, 456, 7889];
    const reg = new RegExp(`/3d/models/8765/revisions/delete$`);
    mock
      .onPost(reg, {
        items: revisionIds,
      })
      .reply(200);
    await ThreeD.deleteRevisions(8765, revisionIds);
  });

  test('delete asset mappings', async () => {
    const mappings = [
      {
        assetId: 123,
        nodeId: 321,
      },
      {
        assetId: 1234,
        nodeId: 4321,
      },
    ];
    const reg = new RegExp(`/3d/models/8765/revisions/1632/mappings/delete$`);
    mock
      .onPost(reg, {
        items: mappings,
      })
      .reply(200);
    await ThreeD.deleteAssetMappings(8765, 1632, mappings);
  });

  test('list asset mappings', async () => {
    const params = {
      cursor: 'crs',
      limit: 12,
      nodeId: 32,
      assetId: 8728,
    };
    const reg = new RegExp(`/3d/models/8765/revisions/1632/mappings$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: assetMappings,
        },
      });
    const result = await ThreeD.listAssetMappings(8765, 1632, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: assetMappings,
    });
  });

  test('list models', async () => {
    const params = {
      cursor: 'crs',
      limit: 12,
      published: true,
    };
    const reg = new RegExp(`/3d/models$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: models,
        },
      });
    const result = await ThreeD.listModels(params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: models,
    });
  });

  test('list nodes', async () => {
    const params = {
      cursor: 'crs',
      limit: 12,
      depth: 20,
      nodeId: 5,
      metadata: {
        key1: 'value1',
        key2: 'value2',
      },
    };
    const reg = new RegExp(`/3d/models/12/revisions/34/nodes$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: nodes,
        },
      });
    const result = await ThreeD.listNodes(12, 34, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: nodes,
    });
  });

  test('list node ancestors', async () => {
    const params = {
      nodeId: 5,
      cursor: 'crs',
      limit: 12,
    };
    const reg = new RegExp(`/3d/models/12/revisions/34/nodes/ancestors$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: nodes,
        },
      });
    const result = await ThreeD.listNodeAncestors(12, 34, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: nodes,
    });
  });

  test('list revisions', async () => {
    const params = {
      cursor: 'crs',
      limit: 12,
      published: true,
    };
    const reg = new RegExp(`/3d/models/12/revisions$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: revisions,
        },
      });
    const result = await ThreeD.listRevisions(12, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: revisions,
    });
  });

  test('list sectors', async () => {
    const expectedParams = {
      boundingBox: '12.4,3,-0.4,15,9.9,0.4',
      cursor: 'crs',
      limit: 12,
    };
    const params = {
      boundingBox: {
        min: [12.4, 3, -0.4],
        max: [15, 9.9, 0.4],
      },
      cursor: 'crs',
      limit: 12,
    };
    const reg = new RegExp(`/3d/models/12/revisions/45/sectors$`);
    const previousCursor = 'abcdef';
    const nextCursor = 'defgh';
    mock
      .onGet(reg, {
        params: expectedParams,
      })
      .reply(200, {
        data: {
          previousCursor,
          nextCursor,
          items: sectors,
        },
      });
    const result = await ThreeD.listSectors(12, 45, params);
    expect(result).toEqual({
      previousCursor,
      nextCursor,
      items: sectors,
    });
  });
});
