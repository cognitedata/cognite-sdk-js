// Copyright 2019 Cognite AS

import { readFileSync } from 'fs';
import CogniteClient from '../../cogniteClient';
import { FilesMetadata } from '../../types/types';
import { HttpResponseType } from '../../utils/http/basicHttpClient';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Files integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  const postfix = randomInt();
  const fileMeta = {
    name: 'filename_0_' + postfix,
    mimeType: 'text/plain;charset=UTF-8',
    metadata: {
      key: 'value',
    },
  };
  const fileContent = 'content_' + new Date();

  let file: FilesMetadata;

  test('create', async () => {
    file = await client.files.upload(fileMeta, fileContent, false, true);
  });

  test('retrieve', async () => {
    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(fileMeta.mimeType);
    expect(retrievedFile.uploaded).toBeTruthy();
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
    const updatedFiles = await client.files.update([
      {
        id: file.id,
        update: {
          source: { set: newSource },
        },
      },
    ]);
    expect(updatedFiles[0].source).toBe(newSource);
  });

  test('upload with overwrite', async () => {
    await client.files.upload(fileMeta, fileContent, true, true);
  });

  test('delete', async () => {
    const response = await client.files.delete([{ id: file.id }]);
    expect(response).toEqual({});
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
});
