// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import CogniteClient from '../../cogniteClient';
import {
  CreateRevision3D,
  FilesMetadata,
  Model3D,
  Revision3D,
} from '../../types/types';
import { randomInt, retryInSeconds, setupLoggedInClient } from '../testUtils';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.REVISION_3D_INTEGRATION_TEST === 'true'
    ? describe
    : describe.skip;

describeIfCondition('Viewer3D integration test', () => {
  let client: CogniteClient;

  let revisions: Revision3D[];
  let file: FilesMetadata;
  let model: Model3D;

  beforeAll(async () => {
    client = setupLoggedInClient();
    jest.setTimeout(2 * 60 * 1000);

    const fileContent = readFileSync('src/__tests__/test3dFile.fbx');
    [[model], file] = await Promise.all([
      // create 3D model
      client.models3D.create([{ name: `Model revision test ${randomInt()}` }]),
      // upload file
      client.files.upload(
        { name: `file_revision_test_${randomInt()}.fbx` },
        fileContent,
        false,
        true
      ),
    ]);
    // Copied from revision3D integration test
    const revisionsToCreate: CreateRevision3D[] = [{ fileId: file.id }];
    revisions = await client.revisions3D.create(model.id, revisionsToCreate);
    expect(revisions.length).toBe(1);

    // wait for revision to process
    const req = async () => {
      const processingRevision = await client.revisions3D.retrieve(
        model.id,
        revisions[0].id
      );
      if (['Queued', 'Processing'].indexOf(processingRevision.status) !== -1) {
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

  afterAll(async () => {
    await Promise.all([
      // delete created 3D model
      client.models3D.delete([{ id: model.id }]),
      // delete uploaded file
      client.files.delete([{ id: file.id }]),
      // delete revisions
      client.revisions3D.delete(model.id, revisions.map(r => ({ id: r.id }))),
    ]);
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
});
