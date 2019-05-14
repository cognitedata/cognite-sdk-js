// Copyright 2019 Cognite AS

import MockAdapter from 'axios-mock-adapter';
import { readFileSync } from 'fs';
import { API } from '../../resources/api';
import {
  CreateRevision3D,
  Model3D,
  Revision3D,
  Tuple3,
  UpdateRevision3D,
  UploadFileMetadataResponse,
} from '../../types/types';
import { setupClient, simpleCompare, retryInSeconds } from '../testUtils';

describe('Revision3d integration test', async () => {
  let client: API;
  let mock: MockAdapter;

  beforeAll(async () => {
    jest.setTimeout(30000);
    client = await setupClient();
  });

  const now = Date.now();
  let revisions: Revision3D[];
  let file: UploadFileMetadataResponse;
  let model: Model3D;

  test('create model', async () => {
    const modelToCreate = { name: `Model revision test ${now}` };
    model = (await client.models3D.create([modelToCreate]))[0];
    expect(model).toBeTruthy();
  });

  test('create file', async () => {
    const fileContent = readFileSync('src/__tests__/test3dFile.fbx');
    const fileProps = { name: `file_revision_test_${now}.fbx` };
    file = await client.files.upload(fileProps, fileContent);
    expect(file).toBeTruthy();
  });

  test(
    'create revision',
    async done => {
      const revisionsToCreate: CreateRevision3D[] = [{ fileId: file.id }];
      revisions = await retryInSeconds(
        () => client.revisions3D.create(model.id, revisionsToCreate),
        3,
        400,
        60
      );
      expect(revisions.length).toBe(1);
      done();
    },
    10 * 1000
  );

  test('retrieve', async () => {
    const retrieved = await client.revisions3D.retrieve(
      model.id,
      revisions[0].id
    );
    expect(retrieved.fileId).toBe(file.id);
    expect(retrieved.published).toBeFalsy();
    expect(retrieved.rotation).toBeFalsy();
  });

  test('update', async () => {
    const newRotation: Tuple3<number> = [3, 14, 15];
    const newCameraTarget: Tuple3<number> = [1, 2, 3];
    const newCameraPosition: Tuple3<number> = [3, 2, 1];
    const revisionsToUpdate: UpdateRevision3D[] = revisions.map(revision => ({
      id: revision.id,
      update: {
        rotation: {
          set: newRotation,
        },
        camera: {
          set: {
            target: newCameraTarget,
            position: newCameraPosition,
          },
        },
      },
    }));
    const updatedRevisions = await client.revisions3D.update(
      model.id,
      revisionsToUpdate
    );
    updatedRevisions.forEach(revision =>
      expect(revision.rotation).toEqual(newRotation)
    );
    updatedRevisions.forEach(revision =>
      expect(revision.camera && revision.camera.target).toEqual(newCameraTarget)
    );
    updatedRevisions.forEach(revision =>
      expect(revision.camera && revision.camera.position).toEqual(
        newCameraPosition
      )
    );
  });

  test('list', async () => {
    const listed = await client.revisions3D.list(model.id).autoPagingToArray();
    expect(revisions.map(r => r.id).sort(simpleCompare)).toEqual(
      listed.map(r => r.id).sort(simpleCompare)
    );
  });

  const itemsMock = [
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

  test('list 3d nodes (mocked)', async () => {
    mock = new MockAdapter(client._instance);
    const regExp = new RegExp(
      `/3d/models/${model.id}/revisions/${revisions[0].id}/nodes`
    );
    mock.onGet(regExp).reply(200, {
      items: itemsMock,
    });
    const result = await client.revisions3D
      .list3DNodes(model.id, revisions[0].id)
      .autoPagingToArray();
    expect(result).toEqual(itemsMock);
    mock.restore();
  });

  test('list 3d node ancestors (mocked)', async () => {
    mock = new MockAdapter(client._instance);
    const regExp = new RegExp(
      `/3d/models/${model.id}/revisions/${revisions[0].id}/nodes/1/ancestors`
    );
    mock.onGet(regExp).reply(200, {
      items: itemsMock,
    });
    const result = await client.revisions3D
      .list3DNodeAncestors(model.id, revisions[0].id, 1)
      .autoPagingToArray();
    expect(result).toEqual(itemsMock);
    mock.restore();
  });

  test('delete revisions', async () => {
    await client.revisions3D.delete(
      model.id,
      revisions.map(r => ({ id: r.id }))
    );
  });

  test('list empty', async () => {
    const listed = await client.revisions3D.list(model.id).autoPagingToArray();
    expect(listed).toEqual([]);
  });

  test('delete model', async () => {
    await client.models3D.delete([{ id: model.id }]);
  });

  test('delete file', async () => {
    await client.files.delete([{ id: file.id }]);
  });
});
