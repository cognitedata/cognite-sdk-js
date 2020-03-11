// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import CogniteClient from '../../cogniteClient';
import { Asset } from '../../resources/classes/asset';
import { ExternalFilesMetadata, FilesMetadata } from '../../types/types';
import { HttpResponseType } from '../../utils/http/basicHttpClient';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('Files integration test', () => {
  let client: CogniteClient;
  let asset: Asset;
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

  const postfix = randomInt();
  const fileContent = 'content_' + new Date();
  const sourceCreatedTime = new Date();
  const localFileMeta: ExternalFilesMetadata = {
    name: 'filename_0_' + postfix,
    mimeType: 'text/plain;charset=UTF-8',
    metadata: {
      key: 'value',
    },
    sourceCreatedTime,
  };

  let file: FilesMetadata;

  test('create', async () => {
    file = await client.files.upload(localFileMeta, fileContent, false, true);
  });

  test('retrieve', async () => {
    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(localFileMeta.mimeType);
    expect(retrievedFile.uploaded).toBeTruthy();
    expect(retrievedFile.sourceCreatedTime).toEqual(sourceCreatedTime);
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
    const newSource = 'def';
    const newSourceModifiedTime = new Date();
    const newAssetIds = [asset.id];
    const updatedFiles = await client.files.update([
      {
        id: file.id,
        update: {
          source: { set: newSource },
          sourceModifiedTime: { set: newSourceModifiedTime },
          assetIds: { set: newAssetIds },
        },
      },
    ]);
    expect(updatedFiles[0].source).toBe(newSource);
    expect(updatedFiles[0].sourceModifiedTime).toEqual(newSourceModifiedTime);
    expect(updatedFiles[0].assetIds).toEqual(newAssetIds);
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
    const fileContentBinary = readFileSync('src/__tests__/test3dFile.fbx');
    let binaryFile: FilesMetadata;

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
