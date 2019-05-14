// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import { API } from '../../resources/api';
import { Asset } from '../../types/asset';
import {
  AssetMapping3D,
  CreateAssetMapping3D,
  CreateRevision3D,
  Model3D,
  Node3D,
  Revision3D,
  UploadFileMetadataResponse,
} from '../../types/types';
import { retryInSeconds, setupClient, simpleCompare } from '../testUtils';

describe('Asset mappings integration test', async () => {
  let client: API;

  beforeAll(async () => {
    jest.setTimeout(30000);
    client = await setupClient();
  });

  const now = Date.now();
  let revisions: Revision3D[];
  let file: UploadFileMetadataResponse;
  let model: Model3D;
  let assets: Asset[];
  let assetMappings: AssetMapping3D[];

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
      console.log('123 modelId', model.id, '123 revisioId', revisions[0].id);
      done();
    },
    10 * 1000
  );

  const rootAsset = {
    name: 'test-root',
    description: 'Root asset for cognitesdk-js test',
    metadata: {
      refId: 'test-root',
    },
    refId: 'test-root',
  };

  const childAsset = {
    name: 'test-child',
    description: 'Child asset for cognitesdk-js test',
    metadata: {
      refId: 'test-child',
    },
    parentRefId: 'test-root',
  };

  test('create assets', async () => {
    assets = await client.assets.create([childAsset, rootAsset]);
  });

  let nodes3D: Node3D[];
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
      assetId: Number(assets[index].id),
    }));
    assetMappings = await client.assetMappings3D.create(
      model.id,
      revisions[0].id,
      assetMappingsToCreate
    );
    expect(assetMappings.map(a => a.assetId).sort(simpleCompare)).toEqual(
      assetMappingsToCreate.map(a => a.assetId).sort(simpleCompare)
    );
    expect(assetMappings.length).toBe(2);
    console.log(assetMappings);
  });

  test('list asset mappings 3d', async () => {
    const listed = await client.assetMappings3D
      .list(model.id, revisions[0].id)
      .autoPagingToArray({ limit: 2 });
    expect(listed.map(m => m.assetId).sort(simpleCompare)).toEqual(
      assetMappingsToCreate.map(m => m.assetId).sort(simpleCompare)
    );
    expect(listed.map(m => m.nodeId).sort(simpleCompare)).toEqual(
      assetMappingsToCreate.map(m => m.nodeId).sort(simpleCompare)
    );
    expect(listed.length).toBe(2);
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
    const listed = await client.assetMappings3D
      .list(model.id, revisions[0].id)
      .autoPagingToArray();
    expect(listed).toEqual([]);
  });

  test('delete revisions', async () => {
    await client.revisions3D.delete(
      model.id,
      revisions.map(r => ({ id: r.id }))
    );
  });

  test('delete model', async () => {
    await client.models3D.delete([{ id: model.id }]);
  });

  test('delete file', async () => {
    await client.files.delete([{ id: file.id }]);
  });
});
