// Copyright 2019 Cognite AS

import { API } from '../../resources/api';
import { setupClient } from '../testUtils';

describe('Files integration test', async () => {
  let client: API;
  beforeAll(async () => {
    jest.setTimeout(15000);
    client = await setupClient();
  });
  let postfix = new Date().getTime();
  const files = [
    {
      name: 'filename_' + postfix++,
      mimeType: 'image/jpg',
      metadata: {
        key: 'value',
      },
    },
    {
      name: 'filename_' + postfix++,
    },
  ];

  test('create,retrieve,update,delete', async () => {
    const fileContent = 'content_' + new Date();
    const file = await client.files.upload(files[1], fileContent);

    const [retrievedFile] = await client.files.retrieve([{ id: file.id }]);
    expect(retrievedFile.mimeType).toBe(files[0].mimeType);

    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: file.id },
    ]);
    expect(downloadUrl).toBeDefined();

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

    await client.files.delete([{ id: file.id }]);
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
