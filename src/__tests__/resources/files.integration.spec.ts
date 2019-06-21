// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { FilesMetadata } from '../../types';
import { randomInt, setupLoggedInClient } from '../testUtils';

describe('Files integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });
  const postfix = randomInt();
  const files = [
    {
      name: 'filename_0_' + postfix,
      mimeType: 'image/jpg',
      metadata: {
        key: 'value',
      },
    },
    {
      name: 'filename_' + postfix,
    },
  ];
  const fileContent = 'content_' + new Date();
  let file: FilesMetadata;

  test('create', async () => {
    file = await client.files.upload(files[0], fileContent, false, true);
  });

  test('retrieve', async () => {
    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(files[0].mimeType);
    expect(retrievedFile.uploaded).toBeTruthy();
  });

  test('download', async () => {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: file.id },
    ]);
    expect(downloadUrl).toBeDefined();
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
    await client.files.upload(files[0], fileContent, true, true);
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
});
