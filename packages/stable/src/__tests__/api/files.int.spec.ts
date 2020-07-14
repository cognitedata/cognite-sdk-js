// Copyright 2020 Cognite AS

import { HttpResponseType } from '@cognite/sdk-core';
import { readFileSync } from 'fs';
import { AssetImpl } from '../../api/classes/asset';
import CogniteClient from '../../cogniteClient';
import { FileInfo } from '../../types';
import { join } from 'path';
import {
  getFileCreateArgs,
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

const testfile = join(__dirname, '../test3dFile.fbx');

describe('Files integration test', () => {
  let client: CogniteClient;
  let asset: AssetImpl;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      {
        name: 'asset_' + randomInt(),
      },
    ]);
  });

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
  });

  const {
    fileContent,
    localFileMeta,
    postfix,
    sourceCreatedTime,
  } = getFileCreateArgs();

  let file: FileInfo;

  test('create', async () => {
    file = await client.files.upload(localFileMeta, fileContent, false, true);
  });

  test('retrieve', async () => {
    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(localFileMeta.mimeType);
    expect(retrievedFile.uploaded).toBeTruthy();
    expect(retrievedFile.sourceCreatedTime).toEqual(sourceCreatedTime);
  });

  test('retrieve with non-existent id', async () => {
    const res = await client.files.retrieve([{ id: 1 }], {
      ignoreUnknownIds: true,
    });
    expect(res.length).toBe(0);
  });

  test('count aggregate', async () => {
    const aggregates = await client.files.aggregate({
      filter: {
        name: file.name,
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
  });

  test('download', async () => {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: file.id },
    ]);
    expect(downloadUrl).toBeDefined();
    const response = await client.get(downloadUrl, {
      responseType: HttpResponseType.Text,
    });
    expect(response.data).toBe(fileContent);
  });

  test('update', async () => {
    const newAssetIds = [asset.id];
    const newSecurityCategories = [123];
    const newSource = 'def';
    const newSourceModifiedTime = new Date();
    const updatedFiles = await client.files.update([
      {
        id: file.id,
        update: {
          assetIds: { set: newAssetIds },
          securityCategories: { set: newSecurityCategories },
          source: { set: newSource },
          sourceModifiedTime: { set: newSourceModifiedTime },
        },
      },
    ]);
    expect(updatedFiles[0].assetIds).toEqual(newAssetIds);
    expect(updatedFiles[0].securityCategories).toEqual(newSecurityCategories);
    expect(updatedFiles[0].source).toBe(newSource);
    expect(updatedFiles[0].sourceModifiedTime).toEqual(newSourceModifiedTime);
  });

  test('list rootAssetIds filter', async () => {
    runTestWithRetryWhenFailing(async () => {
      const { items } = await client.files.list({
        filter: {
          rootAssetIds: [{ id: asset.id }],
        },
        limit: 1,
      });
      expect(items[0].id).toEqual(file.id);
    });
  });

  test('list assetSubtreeIds filter', async () => {
    const { items } = await client.files.list({
      filter: {
        assetSubtreeIds: [{ id: asset.id }],
      },
      limit: 1,
    });
    expect(items).toBeInstanceOf(Array); // cannot check exact response because of [CDF-1614] bug
  });

  test('upload with overwrite', async () => {
    await client.files.upload(localFileMeta, fileContent, true, true);
  });

  test('list', async () => {
    const response = await client.files.list().autoPagingToArray({ limit: 10 });
    expect(response.length).toBeGreaterThan(0);
    expect(response[0].id).toBeDefined();
  });

  test('search', async () => {
    const result = await client.files.search({
      search: {
        name: 'filename_',
      },
    });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  describe('binary file', () => {
    const binaryFileMeta = {
      name: 'filename_1_' + postfix,
      mimeType: 'application/octet-stream',
    };
    const fileContentBinary = readFileSync(testfile);
    let binaryFile: FileInfo;

    test('create', async () => {
      binaryFile = await client.files.upload(
        binaryFileMeta,
        fileContentBinary,
        false,
        true
      );
    });

    test('download', async () => {
      const [{ downloadUrl }] = await client.files.getDownloadUrls([
        { id: binaryFile.id },
      ]);
      expect(downloadUrl).toBeDefined();
      const response = await client.get<ArrayBuffer>(downloadUrl, {
        responseType: HttpResponseType.ArrayBuffer,
      });
      expect(response.data).toEqual(fileContentBinary.buffer);
    });
  });
  test('delete', async () => {
    const response = await client.files.delete([{ id: file.id }]);
    expect(response).toEqual({});
  });
});
