// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import { API } from '../../resources/api';
import {
  Asset,
  AssetMapping3D,
  CreateAssetMapping3D,
  CreateRevision3D,
  FilesMetadata,
  Model3D,
  Node3D,
  Revision3D,
  Tuple3,
  UpdateRevision3D,
} from '../../types/types';
import {
  getSortedPropInArray,
  retryInSeconds,
  setupClient,
  simpleCompare,
} from '../testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.REVISION_3D_INTEGRATION_TEST === 'true'
    ? describe
    : describe.skip;

describeIfCondition(
  '3D - Revision, nodes, assetMappings integration test',
  async () => {
    let client: API;

    const now = Date.now();
    let revisions: Revision3D[];
    let file: FilesMetadata;
    let model: Model3D;
    let assets: Asset[];
    let assetMappings: AssetMapping3D[];
    let nodes3D: Node3D[];

    beforeAll(async () => {
      client = await setupClient();

      const rootAsset = {
        name: 'test-root' + now,
        externalId: 'test-root' + now,
      };
      const childAsset = {
        name: 'test-child' + now,
        parentExternalId: rootAsset.externalId,
      };

      const fileContent = readFileSync('src/__tests__/test3dFile.fbx');
      [[model], file, assets] = await Promise.all([
        // create 3D model
        client.models3D.create([{ name: `Model revision test ${now}` }]),
        // upload file
        client.files.upload(
          { name: `file_revision_test_${now}.fbx` },
          fileContent,
          false,
          true
        ),
        // create assets
        client.assets.create([childAsset, rootAsset]),
      ]);
    });

    afterAll(async () => {
      await Promise.all([
        // delete created 3D model
        client.models3D.delete([{ id: model.id }]),
        // delete uploaded file
        client.files.delete([{ id: file.id }]),
        // deleted created assets
        client.assets.delete(assets.map(item => ({ id: item.id }))),
      ]);
    });

    test('create revision', async () => {
      const revisionsToCreate: CreateRevision3D[] = [{ fileId: file.id }];
      revisions = await client.revisions3D.create(model.id, revisionsToCreate);
      expect(revisions.length).toBe(1);
    });

    test('retrieve', async () => {
      const retrieved = await client.revisions3D.retrieve(
        model.id,
        revisions[0].id
      );
      expect(retrieved.fileId).toBe(file.id);
      expect(retrieved.published).toBeFalsy();
      expect(retrieved.rotation).not.toBeDefined();
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
        expect(revision.camera && revision.camera.target).toEqual(
          newCameraTarget
        )
      );
      updatedRevisions.forEach(revision =>
        expect(revision.camera && revision.camera.position).toEqual(
          newCameraPosition
        )
      );
    });

    test('list', async () => {
      const list = await client.revisions3D.list(model.id).autoPagingToArray();
      expect(revisions.map(r => r.id).sort(simpleCompare)).toEqual(
        list.map(r => r.id).sort(simpleCompare)
      );
    });

    test(
      'list 3d nodes',
      async done => {
        const req = async () =>
          client.revisions3D
            .list3DNodes(model.id, revisions[0].id)
            .autoPagingToArray();
        nodes3D = await retryInSeconds(req, 5, 404, 5 * 60);
        expect(nodes3D.map(n => n.name)).toContain('input_Input_1.fbx');
        done();
      },
      5 * 60 * 1000
    );

    let assetMappingsToCreate: CreateAssetMapping3D[];
    test('create asset mappings 3d', async () => {
      assetMappingsToCreate = nodes3D.slice(0, 2).map((node, index) => ({
        nodeId: node.id,
        assetId: assets[index].id,
      }));
      assetMappings = await client.assetMappings3D.create(
        model.id,
        revisions[0].id,
        assetMappingsToCreate
      );
      expect(getSortedPropInArray(assetMappings, 'assetId')).toEqual(
        getSortedPropInArray(assetMappingsToCreate, 'assetId')
      );
      expect(assetMappings.length).toBe(2);
    });

    test('list asset mappings 3d', async () => {
      const list = await client.assetMappings3D
        .list(model.id, revisions[0].id)
        .autoPagingToArray({ limit: 2 });

      expect(getSortedPropInArray(list, 'assetId')).toEqual(
        getSortedPropInArray(assetMappingsToCreate, 'assetId')
      );
      expect(getSortedPropInArray(list, 'nodeId')).toEqual(
        getSortedPropInArray(list, 'nodeId')
      );
      expect(list.length).toBe(2);
    });

    test('delete asset mappings 3d', async () => {
      const deleted = await client.assetMappings3D.delete(
        model.id,
        revisions[0].id,
        assetMappingsToCreate
      );
      expect(deleted).toEqual({});
    });

    test('list asset mappings 3d (empty)', async () => {
      const list = await client.assetMappings3D
        .list(model.id, revisions[0].id)
        .autoPagingToArray();
      expect(list).toEqual([]);
    });

    test('delete revisions', async () => {
      const deleted = await client.revisions3D.delete(
        model.id,
        revisions.map(r => ({ id: r.id }))
      );
      expect(deleted).toEqual({});
    });

    test('list empty', async () => {
      const list = await client.revisions3D.list(model.id).autoPagingToArray();
      expect(list).toEqual([]);
    });
  }
);
