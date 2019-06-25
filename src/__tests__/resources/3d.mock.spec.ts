// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import CogniteClient from '../../cogniteClient';
import {
  Model3D,
  Node3D,
  RevealNode3D,
  RevealRevision3D,
  RevealSector3D,
  Revision3D,
  UnrealRevision3D,
} from '../../types/types';
import { transformDateInRequest } from '../../utils';
import {
  randomInt,
  setupLoggedInClient,
  string2arrayBuffer,
} from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('3D mocked', () => {
  let client: CogniteClient;
  let mock: MockAdapter;
  const model: Model3D = {
    id: randomInt(),
    name: 'Model name',
    createdTime: new Date(),
  };
  const revision: Revision3D = {
    assetMappingCount: 10,
    createdTime: new Date(),
    fileId: randomInt(),
    published: true,
    id: randomInt(),
    status: 'Done',
  };
  const nodes: Node3D[] = [
    {
      id: randomInt(),
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
  const revisionReveal: RevealRevision3D = {
    ...revision,
    sceneThreedFiles: [
      {
        version: randomInt(),
        fileId: randomInt(),
      },
    ],
  };
  const nodesReveal: RevealNode3D[] = nodes.map(node3D => ({
    ...node3D,
    sectorId: randomInt(),
  }));
  const sectors: RevealSector3D[] = [
    {
      id: randomInt(),
      path: '1/9/8/4',
      parentId: randomInt(),
      depth: randomInt(),
      boundingBox: {
        min: [0, 0, 0],
        max: [100, 100, 100],
      },
      threedFiles: [
        {
          version: randomInt(),
          fileId: randomInt(),
        },
        {
          fileId: randomInt(),
          version: randomInt(),
        },
      ],
    },
  ];
  const revisionUnreal: UnrealRevision3D = { ...revisionReveal };

  beforeAll(async () => {
    client = setupLoggedInClient();
    mock = new MockAdapter(client.instance);
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

    test('update thumbnail', async () => {
      expect.assertions(2);
      const regExp = new RegExp(
        `/3d/models/${model.id}/revisions/${revision.id}/thumbnail`
      );
      const fileId = randomInt();
      mock.onPost(regExp).replyOnce(config => {
        expect(JSON.parse(config.data)).toEqual({ fileId });
        return [200, {}];
      });
      const response = await client.revisions3D.updateThumbnail(
        model.id,
        revision.id,
        fileId
      );
      expect(response).toEqual({});
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

  describe('Viewer 3D', () => {
    test('Retrieve a 3D revision (Reveal)', async () => {
      const regExp = new RegExp(
        `/3d/reveal/models/${model.id}/revisions/${revisionReveal.id}`
      );
      mock.onGet(regExp).reply(200, revisionReveal);
      const result = await client.viewer3D.retrieveRevealRevision3D(
        model.id,
        revisionReveal.id
      );
      expect(result).toEqual(revisionReveal);
    });

    test('List 3d nodes (Reveal)', async () => {
      const regExp = new RegExp(
        `/3d/reveal/models/${model.id}/revisions/${revisionReveal.id}/nodes`
      );
      mock.onGet(regExp).reply(200, {
        items: nodesReveal,
      });
      const result = await client.viewer3D
        .listRevealNodes3D(model.id, revisionReveal.id)
        .autoPagingToArray();
      expect(result).toEqual(nodesReveal);
    });

    test('List 3d node ancestors (Reveal)', async () => {
      const regExp = new RegExp(
        `/3d/reveal/models/${model.id}/revisions/${revisionReveal.id}/nodes`
      );
      mock.onGet(regExp).reply(200, {
        items: nodesReveal,
      });
      const result = await client.viewer3D
        .listRevealNode3DAncestors(model.id, revisionReveal.id, randomInt())
        .autoPagingToArray();
      expect(result).toEqual(nodesReveal);
    });

    test('List 3d sectors (Reveal)', async () => {
      const regExp = new RegExp(
        `/3d/reveal/models/${model.id}/revisions/${revisionReveal.id}/sectors`
      );
      mock.onGet(regExp).reply(200, {
        items: sectors,
      });
      const result = await client.viewer3D
        .listRevealSectors3D(model.id, revisionReveal.id, { limit: 1 })
        .autoPagingToArray();
      expect(result).toEqual(sectors);
    });

    test('Retrieve a 3d revision (unreal)', async () => {
      const regExp = new RegExp(
        `/3d/unreal/models/${model.id}/revisions/${revisionUnreal.id}`
      );
      mock.onGet(regExp).reply(200, revisionUnreal);
      const response = await client.viewer3D.retrieveUnrealRevision3D(
        model.id,
        revisionUnreal.id
      );
      expect(response).toEqual(revisionUnreal);
    });
  });
});
