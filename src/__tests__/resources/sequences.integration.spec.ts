// Copyright 2019 Cognite AS

import * as nock from 'nock';
import CogniteClient from '../../cogniteClient';
import { Asset } from '../../resources/classes/asset';
import {
  ExternalSequence,
  Sequence,
  SequenceRowsInsert,
  SequenceValueType,
} from '../../types/types';
import {
  mockBaseUrl,
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
  setupMockableClient,
} from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('Sequences integration test', () => {
  let client: CogniteClient;
  let mockedClient: CogniteClient;
  let sequences: Sequence[];
  const testValues = [1, 1.5, 'two'];
  const testExternalId = 'sequence' + randomInt();
  let sequenceToCreate: ExternalSequence = {
    name: 'sequence1',
    description: 'description',
    columns: [
      {
        externalId: 'column',
      },
    ],
  };
  const sequencesToCreate: ExternalSequence[] = [
    sequenceToCreate,
    {
      externalId: testExternalId,
      columns: [
        {
          externalId: 'one',
          valueType: SequenceValueType.LONG,
        },
        {
          externalId: 'one_and_a_half',
          valueType: SequenceValueType.DOUBLE,
        },
        {
          externalId: 'two',
          valueType: SequenceValueType.STRING,
        },
      ],
    },
  ];
  const testRows = new Array(3).fill(null).map((_, i) => ({
    rowNumber: i,
    values: testValues,
  }));
  const mockedResponse = {
    nextCursor: 1,
    externalId: sequencesToCreate[1].externalId,
    columns: sequencesToCreate[1].columns,
    rows: testRows,
  };
  let asset: Asset;
  beforeAll(async () => {
    client = setupLoggedInClient();
    mockedClient = setupMockableClient();
    nock.cleanAll();
    [asset] = await client.assets.create([
      {
        name: 'asset_' + randomInt(),
      },
    ]);
    sequenceToCreate = {
      ...sequenceToCreate,
      assetId: asset.id,
    };
  });

  test('create', async () => {
    sequences = await client.sequences.create(sequencesToCreate);
    const [sequence] = sequences;
    const sequenceColumns = sequence.columns.map(({ externalId }) => ({
      externalId,
    }));
    expect(sequenceColumns).toEqual(sequenceToCreate.columns);
    expect(sequence.lastUpdatedTime).toBeInstanceOf(Date);
  });

  describe('filter on sequence.name', () => {
    test('list', async () => {
      const [sequence] = await client.sequences
        .list({
          filter: { name: sequences[0].name },
        })
        .autoPagingToArray({ limit: 1 });
      expect(sequence.name).toBe(sequences[0].name);
    });

    test('filter on assetIds', async () => {
      runTestWithRetryWhenFailing(async () => {
        const { items } = await client.sequences.list({
          filter: { assetIds: [asset.id] },
          limit: 1,
        });
        expect(items[0].name).toBe(sequences[0].name);
      });
    });

    test('filter on rootAssetIds', async () => {
      runTestWithRetryWhenFailing(async () => {
        const { items } = await client.sequences.list({
          filter: { rootAssetIds: [asset.id] },
          limit: 1,
        });
        expect(items[0].name).toBe(sequences[0].name);
      });
    });

    test('filter on assetSubtreeIds', async () => {
      runTestWithRetryWhenFailing(async () => {
        const { items } = await client.sequences.list({
          filter: { assetSubtreeIds: [{ id: asset.id }] },
          limit: 1,
        });
        expect(items[0].name).toBe(sequences[0].name);
      });
    });
  });

  test('retrieve', async () => {
    const response = await client.sequences.retrieve([
      { id: sequences[0].id },
      { externalId: testExternalId },
    ]);
    expect(response[0].name).toEqual(sequences[0].name);
    expect(response).toHaveLength(2);
    expect(response[0].createdTime).toBeInstanceOf(Date);
  });

  test('update', async () => {
    const [updated] = await client.sequences.update([
      {
        id: sequences[0].id,
        update: {
          name: { setNull: true },
          description: { set: 'hey' },
        },
      },
    ]);
    expect(updated.name).toBeUndefined();
    expect(updated.description).toBe('hey');
  });

  test('search', async () => {
    const result = await client.sequences.search({
      search: {
        query: 'n*m* des*tion',
      },
    });
    expect(result.length).toBeGreaterThan(0);
  });

  test('insert rows', async () => {
    const rowsData: SequenceRowsInsert[] = [
      {
        externalId: testExternalId,
        rows: testRows,
        columns: sequences[1].columns.map(({ externalId }) => externalId!),
      },
      {
        id: sequences[0].id,
        rows: [
          {
            rowNumber: 1,
            values: ['1'],
          },
        ],
        columns: ['column'],
      },
    ];
    const result = await client.sequences.insertRows(rowsData);
    expect(result).toEqual({});
  });

  test('retrieve rows (mocked)', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/sequences/data/list'), {
        externalId: testExternalId,
      })
      .once()
      .reply(200, {
        ...mockedResponse,
        id: sequences[1].id,
      });

    const { items, next } = await mockedClient.sequences.retrieveRows({
      externalId: testExternalId,
    });

    expect(items.length).toBe(3);
    items.forEach((row, index) => {
      expect([...row]).toEqual(testValues);
      expect(row.columns.length).toEqual(3);
      expect(row.rowNumber).toEqual(index);
    });
    expect(typeof next).toBe('function');
  });

  test('delete rows', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.sequences.deleteRows([
        {
          id: sequences[1].id,
          rows: [0, 2],
        },
      ]);
      expect(result).toEqual({});
    });
  });

  test('delete', async () => {
    const result = await client.sequences.delete([
      { id: sequences[0].id },
      { externalId: testExternalId },
    ]);
    expect(result).toEqual({});
  });
});
