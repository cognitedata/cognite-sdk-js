// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { API } from '../../resources/api';
import { Model3D, Node3D, Revision3D } from '../../types/types';
import { transformDateInRequest } from '../../utils';
import { setupClient, string2arrayBuffer } from '../testUtils';

describe('3D mocked', async () => {
  let client: API;
  let mock: MockAdapter;
  const model: Model3D = {
    id: 1122344,
    name: 'Model name',
    createdTime: new Date(),
  };
  const revision: Revision3D = {
    assetMappingCount: 10,
    createdTime: new Date(),
    fileId: 2872490428,
    published: true,
    id: 10983290309,
    status: 'Done',
  };
  const nodes: Node3D[] = [
    {
      id: 1000,
      treeIndex: 3,
      parentId: 2,
      depth: 2,
      name: 'Node name',
      subtreeSize: 4,
      boundingBox: {
        max: [0, 0, 0],
        min: [0, 0, 0],
      },
    },
  ];
  beforeAll(async () => {
    jest.setTimeout(20000);
    client = await setupClient();
    mock = new MockAdapter(client._instance);
  });
  beforeEach(() => {
    mock.reset();
  });

  describe('revisions', () => {
    test('create', async () => {
      const regExp = new RegExp(`/3d/models/${model.id}/revisions`);
      const revisionsToCreate = [{ fileId: revision.fileId }];
      mock.onPost(regExp, { items: revisionsToCreate }).reply(200, {
        items: [transformDateInRequest(revision)],
      });
      const createdRevisions = await client.revisions3D.create(
        model.id,
        revisionsToCreate
      );
      expect(createdRevisions).toEqual([revision]);
    });

    test('list', async () => {
      const regExp = new RegExp(`/3d/models/${model.id}/revisions`);
      mock.onGet(regExp).reply(200, {
        items: [revision],
      });
      const response = await client.revisions3D
        .list(model.id)
        .autoPagingToArray();
      expect(response).toEqual([revision]);
    });

    test('update', async () => {
      const updateRequest = [
        {
          id: revision.id,
          update: { published: { set: true } },
        },
      ];
      const regExp = new RegExp(`/3d/models/${model.id}/revisions/update`);
      mock.onPost(regExp, { items: updateRequest }).reply(200, {
        items: [revision],
      });
      const response = await client.revisions3D.update(model.id, updateRequest);
      expect(response).toEqual([revision]);
    });

    test('delete', async () => {
      const deleteRequest = [revision].map(item => ({ id: item.id }));
      const regExp = new RegExp(`/3d/models/${model.id}/revisions/delete`);
      mock.onPost(regExp, { items: deleteRequest }).reply(200, {});
      const response = await client.revisions3D.delete(model.id, deleteRequest);
      expect(response).toEqual({});
    });

    test('retrieve', async () => {
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}`
      );
      mock.onGet(regExp).reply(200, revision);
      const response = await client.revisions3D.retrieve(model.id, revision.id);
      expect(response).toEqual(revision);
    });

    test('list 3d nodes', async () => {
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/nodes`
      );
      mock.onGet(regExp).reply(200, {
        items: nodes,
      });
      const result = await client.revisions3D
        .list3DNodes(model.id, revision.id)
        .autoPagingToArray();
      expect(result).toEqual(nodes);
    });

    test('list 3d node ancestors', async () => {
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/nodes/1/ancestors`
      );
      mock.onGet(regExp).reply(200, {
        items: nodes,
      });
      const result = await client.revisions3D
        .list3DNodeAncestors(model.id, revision.id, 1)
        .autoPagingToArray();
      expect(result).toEqual(nodes);
    });
  });

  describe('files', () => {
    test('retrieve', async () => {
      const content = string2arrayBuffer('some content');
      const regExp = new RegExp(`/3d/files/123`);
      mock.onGet(regExp).reply(200, content);
      const response = await client.files3D.retrieve(123);
      expect(response).toEqual(content);
    });
  });

  describe('asset mappings', () => {
    const mappings = [
      { nodeId: 232, assetId: 23482, treeIndex: 11, subtreeSize: 1 },
    ];
    const mappingsToCreate = [
      { nodeId: mappings[0].nodeId, assetId: mappings[0].assetId },
    ];

    test('list', async () => {
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/mappings`
      );
      mock
        .onGet(regExp, { params: { limit: 5 } })
        .reply(200, { items: mappings });
      const response = await client.assetMappings3D
        .list(model.id, revision.id, { limit: 5 })
        .autoPagingToArray();
      expect(response).toEqual(mappings);
    });

    test('create', async () => {
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/mappings`
      );
      mock
        .onPost(regExp, { items: mappingsToCreate })
        .reply(200, { items: mappings });
      const response = await client.assetMappings3D.create(
        model.id,
        revision.id,
        mappingsToCreate
      );
      expect(response).toEqual(mappings);
    });

    test('delete', async () => {
      const mappingsToDelete = mappingsToCreate;
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/mappings/delete`
      );
      mock.onPost(regExp, { items: mappingsToDelete }).reply(200, {});
      const response = await client.assetMappings3D.delete(
        model.id,
        revision.id,
        mappingsToDelete
      );
      expect(response).toEqual({});
    });
  });
});
