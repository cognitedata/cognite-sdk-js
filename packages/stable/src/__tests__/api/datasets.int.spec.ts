// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type {
  Asset,
  CogniteEvent,
  CogniteInternalId,
  DataSet,
  DataSetFilterRequest,
  FileInfo,
  NullableSinglePatchLong,
  Sequence,
  Timeseries,
} from '../../types';
import {
  getFileCreateArgs,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

const dataSetFilter = (id: number) => {
  return { filter: { dataSetIds: [{ id }] } };
};

describe('data sets integration test', () => {
  let client: CogniteClient;
  let datasets: DataSet[];
  let updateDataSetObject: { update: { dataSetId: NullableSinglePatchLong } };
  const metadataTimestamp = Date.now().toString();

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    datasets = await client.datasets.create([
      {
        description: 'integration-1',
        metadata: { timestamp: metadataTimestamp },
      },
      { description: 'integration-2' },
    ]);
    updateDataSetObject = { update: { dataSetId: { set: datasets[1].id } } };
    expect(datasets[0].id).toBeTruthy();
    expect(datasets[0].lastUpdatedTime).toBeInstanceOf(Date);
  });
  test('list', async () => {
    const filter: DataSetFilterRequest = {
      filter: {
        createdTime: { min: new Date('1 jan 2020') },
      },
    };
    await client.datasets.list(filter);
  });
  test('count aggregate', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const aggregates = await client.datasets.aggregate({
        filter: {
          metadata: { timestamp: metadataTimestamp },
        },
      });
      expect(aggregates.length).toBe(1);
      expect(aggregates[0].count).toBeGreaterThan(0);
    });
  });
  test('retrieve', async () => {
    const [{ id, description }] = datasets;
    const [{ description: retrievedDescription }] =
      await client.datasets.retrieve([{ id }]);

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
    let dataSetId: CogniteInternalId;
    let file: FileInfo;

    beforeAll(() => {
      dataSetId = datasets[0].id;
    });

    afterAll(async () => {
      await client.files.delete([{ id: file.id }]);
    });

    test('upload', async () => {
      const { localFileMeta, fileContent } = getFileCreateArgs({ dataSetId });

      file = await client.files.upload(localFileMeta, fileContent, false, true);

      expect(file.dataSetId).toEqual(dataSetId);
    });

    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const files = await client.files
          .list(dataSetFilter(dataSetId))
          .autoPagingToArray();
        expect(files.length).toBeTruthy();
        expect(files[0].dataSetId).toEqual(dataSetId);
      });
    });

    test('update', async () => {
      const [updated] = await client.files.update([
        { id: file.id, ...updateDataSetObject },
      ]);

      expect(updated.dataSetId).toEqual(datasets[1].id);
    });
  });
  describe('assets data sets', () => {
    let dataSetId: CogniteInternalId;
    let asset: Asset;

    beforeAll(() => {
      dataSetId = datasets[0].id;
    });
    afterAll(async () => {
      await client.assets.delete([{ id: asset.id }]);
    });

    test('create', async () => {
      [asset] = await client.assets.create([
        { name: 'asset_with_dataset', dataSetId },
      ]);

      expect(asset.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const assets = await client.assets
          .list(dataSetFilter(dataSetId))
          .autoPagingToArray();

        expect(assets.length).toBeTruthy();
        expect(assets[0].dataSetId).toEqual(dataSetId);
      });
    });
    test('update', async () => {
      const [updatedAsset] = await client.assets.update([
        { id: asset.id, ...updateDataSetObject },
      ]);

      expect(updatedAsset.dataSetId).toEqual(datasets[1].id);
    });
  });
  describe('events data sets', () => {
    let dataSetId: CogniteInternalId;
    let event: CogniteEvent;

    beforeAll(() => {
      dataSetId = datasets[0].id;
    });
    afterAll(async () => {
      await client.events.delete([{ id: event.id }]);
    });

    test('create', async () => {
      [event] = await client.events.create([{ dataSetId }]);

      expect(event.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const events = await client.events
          .list(dataSetFilter(dataSetId))
          .autoPagingToArray();

        expect(events.length).toBeTruthy();
        expect(events[0].id).toEqual(event.id);
      });
    });
    test('update', async () => {
      const [updatedEvent] = await client.events.update([
        { id: event.id, ...updateDataSetObject },
      ]);

      expect(updatedEvent.dataSetId).toEqual(datasets[1].id);
    });
  });
  describe('timeseries data sets', () => {
    let timeseries: Timeseries;
    let dataSetId: CogniteInternalId;

    beforeAll(() => {
      dataSetId = datasets[0].id;
    });
    afterAll(async () => {
      await client.timeseries.delete([{ id: timeseries.id }]);
    });

    test('create', async () => {
      [timeseries] = await client.timeseries.create([{ dataSetId }]);

      expect(timeseries.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const filteredTimeseries = await client.timeseries
          .list(dataSetFilter(dataSetId))
          .autoPagingToArray();

        expect(filteredTimeseries.length).toBeTruthy();
      });
    });
    test('update', async () => {
      const [updatedTimeseries] = await client.timeseries.update([
        { id: timeseries.id, ...updateDataSetObject },
      ]);

      expect(updatedTimeseries.dataSetId).toEqual(datasets[1].id);
    });
  });
  describe('sequences data sets', () => {
    let dataSetId: CogniteInternalId;
    let sequence: Sequence;

    beforeAll(() => {
      dataSetId = datasets[0].id;
    });
    afterAll(async () => {
      await client.sequences.delete([{ id: sequence.id }]);
    });

    test('create', async () => {
      [sequence] = await client.sequences.create([
        { columns: [{ externalId: 'someId' }], dataSetId },
      ]);

      expect(sequence.dataSetId).toEqual(dataSetId);
    });
    test('list', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const sequences = await client.sequences
          .list(dataSetFilter(dataSetId))
          .autoPagingToArray();

        expect(sequences.length).toBeTruthy();
        expect(sequences[0].dataSetId).toEqual(dataSetId);
      });
    });
    test('update', async () => {
      const [updatedSequence] = await client.sequences.update([
        { id: sequence.id, ...updateDataSetObject },
      ]);

      expect(updatedSequence.dataSetId).toEqual(datasets[1].id);
    });
  });
});
