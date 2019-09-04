// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import CogniteClient from '../../cogniteClient';
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
  randomInt,
  retryInSeconds,
  setupLoggedInClient,
  simpleCompare,
} from '../testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.REVISION_3D_INTEGRATION_TEST === 'true'
    ? describe
    : describe.skip;

describeIfCondition(
  '3D - Revision, nodes, assetMappings integration test',
  // tslint:disable-next-line:no-big-function
  () => {
    let client: CogniteClient;

    let revisions: Revision3D[];
    let file: FilesMetadata;
    let model: Model3D;
    let assets: Asset[];
    let assetMappings: AssetMapping3D[];
    let nodes3D: Node3D[];

    beforeAll(async () => {
      client = setupLoggedInClient();
      jest.setTimeout(5 * 60 * 1000);

      const rootAsset = {
        name: 'test-root' + randomInt(),
        externalId: 'test-root' + randomInt(),
      };
      const childAsset = {
        name: 'test-child' + randomInt(),
        parentExternalId: rootAsset.externalId,
      };

      const fileContent = readFileSync('src/__tests__/test3dFile.fbx');
      [[model], file, assets] = await Promise.all([
        // create 3D model
        client.models3D.create([
          { name: `Model revision test ${randomInt()}` },
        ]),
        // upload file
        client.files.upload(
          {
            name: `file_revision_test_${randomInt()}.fbx`,
            mimeType: 'application/octet-stream',
          },
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

      // wait for revision to process
      const req = async () => {
        const processingRevision = await client.revisions3D.retrieve(
          model.id,
          revisions[0].id
        );
        if (
          ['Queued', 'Processing'].indexOf(processingRevision.status) !== -1
        ) {
          const error = new Error('Still processing');
          // @ts-ignore
          error.status = 500;
          throw error;
        }
        return processingRevision;
      };
      const revision = await retryInSeconds(req, 5, 500, 5 * 60);
      expect(revision.status).toBe('Done');
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
        nodes3D = await client.revisions3D
          .list3DNodes(model.id, revisions[0].id)
          .autoPagingToArray();
        expect(nodes3D.map(n => n.name)).toContain('RootNode');
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

    test('retrieve a 3d revision (reveal)', async () => {
      const response = await client.viewer3D.retrieveRevealRevision3D(
        model.id,
        revisions[0].id
      );
      expect(response.sceneThreedFiles.length).toBeTruthy();
    });

    test('retrieve a 3d revision (unreal)', async () => {
      const response = await client.viewer3D.retrieveUnrealRevision3D(
        model.id,
        revisions[0].id
      );
      expect(response.sceneThreedFiles.length).toBeTruthy();
    });

    test('retrieve 3d reveal node list', async () => {
      const response = await client.viewer3D.listRevealNodes3D(
        model.id,
        revisions[0].id
      );
      expect(response.items.length).toBeTruthy();
    });

    test('retrieve 3d reveal 3d sectors', async () => {
      const response = await client.viewer3D.listRevealSectors3D(
        model.id,
        revisions[0].id
      );
      expect(response.items.length).toBeTruthy();
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
