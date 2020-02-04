// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import {
  Dataset,
  DatasetFilterRequest,
  FilesMetadata,
} from '../../types/types';
import { getFileCreateArgs } from '../helper';
import { setupLoggedInClient } from '../testUtils';

describe('Datasets integration test', () => {
  let client: CogniteClient;
  let datasets: Dataset[];

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    datasets = await client.datasets.create([
      { description: 'integration-1' },
      { description: 'integration-2' },
    ]);
    expect(datasets[0].id).toBeTruthy();
  });

  test('list', async () => {
    const filter: DatasetFilterRequest = {
      filter: {
        createdTime: { min: new Date('1 jan 2020') },
      },
    };
    await client.datasets.list(filter);
  });
  test('retrieve', async () => {
    const [{ id, description }] = datasets;
    const [
      { description: retrievedDescription },
    ] = await client.datasets.retrieve([{ id }]);

    expect(retrievedDescription).toEqual(description);
  });
  test('update', async () => {
    const [{ id }] = datasets;
    const updatedDescription = 'integration updated';
    const [{ description }] = await client.datasets.update([
      { id, update: { description: { set: updatedDescription } } },
    ]);

    expect(description).toEqual(updatedDescription);
  });
  describe('files datasets', () => {
    let file: FilesMetadata;

    afterAll(async () => {
      await client.files.delete([{ id: file.id }]);
    });

    test('upload', async () => {
      const [{ id }] = datasets;
      const { localFileMeta, fileContent } = getFileCreateArgs({
        dataSetId: id,
      });

      file = await client.files.upload(localFileMeta, fileContent, false, true);

      expect(file.dataSetId).toEqual(id);
    });

    test('list', async () => {
      const [{ id }] = datasets;
      const files = await client.files
        .list({
          filter: { dataSetIds: [id] },
        })
        .autoPagingToArray();
      expect(files.length).toEqual(1);
    });

    test('update', async () => {
      const [{ dataSetId }] = await client.files.update([
        { id: file.id, update: { dataSetId: { set: datasets[1].id } } },
      ]);

      expect(dataSetId).toEqual(datasets[1].id);
    });
  });
});
