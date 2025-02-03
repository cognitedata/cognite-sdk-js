// Copyright 2020 Cognite AS

import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  Asset,
  AssetMapping3D,
  CreateAssetMapping3D,
  CreateRevision3D,
  FileInfo,
  Filter3DNodesQuery,
  Model3D,
  Node3D,
  Revision3D,
  Tuple3,
  UpdateRevision3D,
} from '../../types';
import { randomInt, retryInSeconds, setupLoggedInClient } from '../testUtils';

const describeIfCondition =
  process.env.REVISION_3D_INTEGRATION_TEST === 'true'
    ? describe
    : describe.skip;

describeIfCondition(
  '3D - Revision, nodes, assetMappings integration test',
  () => {
    let client: CogniteClient;

    let revisions: Revision3D[];
    let file: FileInfo;
    let model: Model3D;
    let assets: Asset[];
    let assetMappings: AssetMapping3D[];
    let nodes3D: Node3D[];

    beforeAll(async () => {
      client = setupLoggedInClient();
      vi.setConfig({ testTimeout: 5 * 60 * 1000 });

      const rootAsset = {
        name: `test-root${randomInt()}`,
        externalId: `test-root${randomInt()}`,
      };
      const childAsset = {
        name: `test-child${randomInt()}`,
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
        client.assets.delete(assets.map((item) => ({ id: item.id }))),
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
      expect(retrieved.translation).not.toBeDefined();
      expect(retrieved.scale).not.toBeDefined();
    });

    test('update', async () => {
      const newRotation: Tuple3<number> = [3, 14, 15];
      const newTranslation: Tuple3<number> = [4, 2, -2];
      const newScale: Tuple3<number> = [1.0, 4.0, 0.5];
      const newCameraTarget: Tuple3<number> = [1, 2, 3];
      const newCameraPosition: Tuple3<number> = [3, 2, 1];
      const newMetadata: { [key: string]: string } = {
        property0: 'value0',
        property1: 'value1',
      };
      const revisionsToUpdate: UpdateRevision3D[] = revisions.map(
        (revision) => ({
          id: revision.id,
          update: {
            rotation: {
              set: newRotation,
            },
            translation: {
              set: newTranslation,
            },
            scale: {
              set: newScale,
            },
            camera: {
              set: {
                target: newCameraTarget,
                position: newCameraPosition,
              },
            },
            metadata: {
              set: newMetadata,
            },
          },
        })
      );
      const updatedRevisions = await client.revisions3D.update(
        model.id,
        revisionsToUpdate
      );
      for (const revision of updatedRevisions) {
        expect(revision.rotation).toEqual(newRotation);
        expect(revision.translation).toEqual(newTranslation);
        expect(revision.scale).toEqual(newScale);
        expect(revision.camera?.target).toEqual(newCameraTarget);
        expect(revision.camera?.position).toEqual(newCameraPosition);
        expect(revision.metadata).toBeDefined();
        for (const property in revision.metadata) {
          expect(revision.metadata[property]).toEqual(newMetadata[property]);
        }
      }
    });

    test('list', async () => {
      const list = await client.revisions3D.list(model.id).autoPagingToArray();
      expect(revisions.map((r) => r.id).sort()).toEqual(
        list.map((r) => r.id).sort()
      );
    });

    test(
      'list 3d nodes',
      async () => {
        nodes3D = await client.revisions3D
          .list3DNodes(model.id, revisions[0].id)
          .autoPagingToArray();
        expect(nodes3D.map((n) => n.name)).toContain('RootNode');
      },
      5 * 60 * 1000
    );

    test(
      'retrieve 3d nodes by ids',
      async () => {
        nodes3D = await client.revisions3D
          .list3DNodes(model.id, revisions[0].id)
          .autoPagingToArray({ limit: 2 });
        const nodes = await client.revisions3D.retrieve3DNodes(
          model.id,
          revisions[0].id,
          nodes3D.map((node) => ({ id: node.id }))
        );
        expect(nodes.length).toBe(2);
        expect(nodes[0]).toEqual(nodes3D[0]);
        expect(nodes[1]).toEqual(nodes3D[1]);
      },
      5 * 60 * 1000
    );

    test(
      'filter 3d nodes (empty query)',
      async () => {
        nodes3D = await client.revisions3D
          .filter3DNodes(model.id, revisions[0].id)
          .autoPagingToArray();
        expect(nodes3D.map((n) => n.name)).toContain('RootNode');
      },
      5 * 60 * 1000
    );

    test(
      'filter 3d nodes on properties',
      async () => {
        const propertiesFilter: Filter3DNodesQuery = {
          filter: {
            properties: { CogniteClient: { InheritType: ['1'] } },
          },
        };
        nodes3D = await client.revisions3D
          .filter3DNodes(model.id, revisions[0].id, propertiesFilter)
          .autoPagingToArray();
        expect(nodes3D.length).toBeGreaterThan(0);
      },
      5 * 60 * 1000
    );

    test(
      'filter 3d nodes on names',
      async () => {
        const namesFilter: Filter3DNodesQuery = {
          filter: {
            names: ['RootNode'],
          },
        };
        nodes3D = await client.revisions3D
          .filter3DNodes(model.id, revisions[0].id, namesFilter)
          .autoPagingToArray();
        expect(nodes3D).toHaveLength(1);
      },
      5 * 60 * 1000
    );

    test(
      'filter 3d nodes on bogus names',
      async () => {
        const namesFilter: Filter3DNodesQuery = {
          filter: {
            names: ['Totally-Not-A-Valid-Name', 'Another-Weird-Name'],
          },
        };
        nodes3D = await client.revisions3D
          .filter3DNodes(model.id, revisions[0].id, namesFilter)
          .autoPagingToArray();
        expect(nodes3D.length).toHaveLength(0);
      },
      5 * 60 * 1000
    );

    test(
      'filter 3d nodes (non-existent properties)',
      async () => {
        const propertiesFilter: Filter3DNodesQuery = {
          filter: {
            properties: { Item: { Type: ['something weird'] } },
          },
        };
        nodes3D = await client.revisions3D
          .filter3DNodes(model.id, revisions[0].id, propertiesFilter)
          .autoPagingToArray();
        expect(nodes3D).toHaveLength(0);
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
      expect(assetMappings.map((t) => t.assetId).sort()).toEqual(
        assetMappingsToCreate.map((t) => t.assetId).sort()
      );
      expect(assetMappings.length).toBe(2);
    });

    test('list asset mappings 3d', async () => {
      const list = await client.assetMappings3D
        .list(model.id, revisions[0].id)
        .autoPagingToArray({ limit: 2 });

      expect(list.map((t) => t.assetId).sort()).toEqual(
        assetMappingsToCreate.map((t) => t.assetId).sort()
      );
      expect(list.map((t) => t.nodeId).sort()).toEqual(
        assetMappingsToCreate.map((t) => t.nodeId).sort()
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
        revisions.map((r) => ({ id: r.id }))
      );
      expect(deleted).toEqual({});
    });

    test('list empty', async () => {
      const list = await client.revisions3D.list(model.id).autoPagingToArray();
      expect(list).toEqual([]);
    });
  }
);
