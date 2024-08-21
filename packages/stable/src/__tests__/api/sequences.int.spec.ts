// Copyright 2020 Cognite AS

import { beforeAll, describe, expect, test } from 'vitest';
import {
  type ExternalSequence,
  type Sequence,
  type SequenceRowsInsert,
  SequenceValueType,
} from '../../types';
import {
  randomInt,
  runTestWithRetryWhenFailing,
  setupLoggedInClient,
} from '../testUtils';

describe('Sequences integration test', () => {
  let client: CogniteClient;
  let sequences: Sequence[];
  const testValues = [1, 1.5, 'two'];
  const testExternalId = `sequence${randomInt()}`;
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
  let asset: Asset;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      {
        name: `asset_${randomInt()}`,
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

  test('retrieve with non-existent external id', async () => {
    const res = await client.sequences.retrieve([{ externalId: '_n/a_' }], {
      ignoreUnknownIds: true,
    });
    expect(res.length).toBe(0);
  });

  test('count aggregate', async () => {
    const aggregates = await client.sequences.aggregate({
      filter: {
        name: sequences[0].name,
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
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
    runTestWithRetryWhenFailing(async () => {
      const result = await client.sequences.search({
        search: {
          query: 'n*m* des*tion',
        },
      });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('rows', () => {
    test('insert', async () => {
      const rowsData: SequenceRowsInsert[] = [
        {
          externalId: testExternalId,
          rows: testRows,
          columns: sequences[1].columns.map(
            ({ externalId }) => externalId || ''
          ),
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

    test('retrieve', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const result = await client.sequences.retrieveRows({
          externalId: testExternalId,
        });

        expect(result.items).toHaveLength(testRows.length);
        expect(result.items[0].columns[0].externalId).toEqual(
          sequencesToCreate[1].columns[0].externalId
        );
      });
    });

    test('delete', async () => {
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
  });

  test('delete', async () => {
    const result = await client.sequences.delete([
      { id: sequences[0].id },
      { externalId: testExternalId },
    ]);
    expect(result).toEqual({});
  });
});
