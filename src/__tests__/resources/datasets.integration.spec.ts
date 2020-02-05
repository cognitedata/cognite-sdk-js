// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { TimeSeries } from '../../resources/classes/timeSeries';
import {
  Asset,
  CogniteEvent,
  DataSet,
  DataSetFilterRequest,
  FilesMetadata,
  Sequence,
} from '../../types/types';
import { getFileCreateArgs } from '../helper';
import { runTestWithRetryWhenFailing, setupLoggedInClient } from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('data sets integration test', () => {
  let client: CogniteClient;
  let datasets: DataSet[];

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
    const filter: DataSetFilterRequest = {
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
  describe('files data sets', () => {
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
      await runTestWithRetryWhenFailing(async () => {
        const [{ id }] = datasets;
        const files = await client.files
          .list({
            filter: { dataSetIds: [id] },
          })
          .autoPagingToArray();
        expect(files.length).toBeTruthy();
        expect(files[0].dataSetId).toEqual(id);
      });
    });

    test('update', async () => {
      const [{ dataSetId }] = await client.files.update([
        { id: file.id, update: { dataSetId: { set: datasets[1].id } } },
      ]);

      expect(dataSetId).toEqual(datasets[1].id);
    });
  });
  describe('assets data sets', () => {
    let asset: Asset;

    afterAll(async () => {
      await client.assets.delete([{ id: asset.id }]);
    });

    test('create', async () => {
      const [{ id: dataSetId }] = datasets;

      [asset] = await client.assets.create([
        { name: 'asset_with_dataset', dataSetId },
      ]);

      expect(asset.dataSetId).toEqual(dataSetId);
    });
    xtest('list', async () => {
      const [{ id: dataSetId }] = datasets;
      const assets = await client.assets
        .list({
          filter: { dataSetIds: [{ id: dataSetId }] },
        })
        .autoPagingToArray();

      expect(assets.length).toBeTruthy();
      expect(assets[0].dataSetId).toEqual(dataSetId);
    });
    test('update', async () => {
      const updatedDatasetId = datasets[1].id;
      const [updatedAsset] = await client.assets.update([
        { id: asset.id, update: { dataSetId: { set: updatedDatasetId } } },
      ]);

      expect(updatedAsset.dataSetId).toEqual(updatedDatasetId);
    });
  });
  describe('events data sets', () => {
    let event: CogniteEvent;

    afterAll(async () => {
      await client.events.delete([{ id: event.id }]);
    });

    test('create', async () => {
      const [{ id: dataSetId }] = datasets;
      [event] = await client.events.create([{ dataSetId }]);

      expect(event.dataSetId).toEqual(dataSetId);
    });
    xtest('list', async () => {
      const [{ id: dataSetId }] = datasets;
      const events = await client.events
        .list({
          filter: { dataSetIds: [{ id: dataSetId }] },
        })
        .autoPagingToArray();

      expect(events.length).toBeTruthy();
      expect(events[0].id).toEqual(event.id);
    });
    test('update', async () => {
      const { id: updatedDataSetId } = datasets[1];
      const [updatedEvent] = await client.events.update([
        { id: event.id, update: { dataSetId: { set: updatedDataSetId } } },
      ]);

      expect(updatedEvent.dataSetId).toEqual(updatedDataSetId);
    });
  });
  describe('timeseries data sets', () => {
    let timeseries: TimeSeries;

    afterAll(async () => {
      await client.timeseries.delete([{ id: timeseries.id }]);
    });

    test('create', async () => {
      const [{ id: dataSetId }] = datasets;

      [timeseries] = await client.timeseries.create([{ dataSetId }]);

      expect(timeseries.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const [{ id: dataSetId }] = datasets;
        const filteredTimeseries = await client.timeseries
          .list({
            dataSetIds: [dataSetId],
          })
          .autoPagingToArray();

        expect(filteredTimeseries.length).toBeTruthy();
      });
    });
    test('update', async () => {
      const { id: dataSetId } = datasets[1];
      const [updatedTimeseries] = await client.timeseries.update([
        { id: timeseries.id, update: { dataSetId: { set: dataSetId } } },
      ]);

      expect(updatedTimeseries.dataSetId).toEqual(dataSetId);
    });
  });
  describe('sequences data sets', async () => {
    let sequence: Sequence;

    afterAll(async () => {
      await client.sequences.delete([{ id: sequence.id }]);
    });

    test('create', async () => {
      const [{ id: dataSetId }] = datasets;

      [sequence] = await client.sequences.create([
        { columns: [{ externalId: 'someId' }], dataSetId },
      ]);

      expect(sequence.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const [{ id: dataSetId }] = datasets;
        const sequences = await client.sequences
          .list({
            filter: { dataSetIds: [dataSetId] },
          })
          .autoPagingToArray();

        expect(sequences.length).toBeTruthy();
        expect(sequences[0].dataSetId).toEqual(dataSetId);
      });
    });
    test('update', async () => {
      const { id: dataSetId } = datasets[1];
      const [updatedSequence] = await client.sequences.update([
        { id: sequence.id, update: { dataSetId: { set: dataSetId } } },
      ]);

      expect(updatedSequence.dataSetId).toEqual(dataSetId);
    });
  });
  xtest('delete', async () => {
    await client.datasets.delete(datasets.map(({ id }) => ({ id })));
  });
});
