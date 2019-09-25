// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { ExternalSequence, Sequence, SequenceRowsInsert, SequenceValueType } from '../../types/types';
import { randomInt, setupLoggedInClient, runTestWithRetryWhenFailing } from '../testUtils';

describe('Sequences integration test', () => {
  let client: CogniteClient;
  let sequences: Sequence[];
  const sequenceToCreate: ExternalSequence[] = [
    {
      name: 'sequence1',
      description: 'description',
      columns: [
        {
          externalId: 'column',
        }
      ],
    },
    {
      externalId: 'sequence' + randomInt(),
      columns: [
        {
          externalId: 'one',
          valueType: SequenceValueType.LONG
        },
        {
          externalId: 'one_and_a_half',
          valueType: SequenceValueType.DOUBLE
        },
        {
          externalId: 'two',
          valueType: SequenceValueType.STRING // not a default??
        }
      ],
    },
  ];
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('create', async () => {
    sequences = await client.sequences.create(sequenceToCreate);
    const [sequence] = sequences;
    expect(sequence.columns.map(({ externalId }) => ({ externalId }))).toEqual(
      sequenceToCreate[0].columns
    );
    expect(sequence.lastUpdatedTime).toBeInstanceOf(Date);
  });

  test('list', async () => {
    const [sequence] = await client.sequences
      .list({
        filter: { name: sequences[0].name },
      })
      .autoPagingToArray({ limit: 1 });
    expect(sequence.name).toBe(sequences[0].name);
  });

  test('retrieve', async () => {
    const response = await client.sequences.retrieve([
      { id: sequences[0].id },
      { externalId: sequences[1].externalId! },
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

  const values = [1, 1.5, 'two'];
  test('insert rows', async () => {
    const rows = new Array(3).fill(null).map((_, i) => ({
      rowNumber: i,
      values
    }));
    const rowsData: SequenceRowsInsert[] = [{
      externalId: sequences[1].externalId!,
      rows,
      columns: sequences[1].columns.map(({ externalId }) => externalId!)
    }, {
      id: sequences[0].id,
      rows: [{
        rowNumber: 1,
        values: ['1']
      }],
      columns: ['column']
    }
  ];
    const result = await client.sequences.insertRows(rowsData);
    expect(result).toEqual({});
  });

  test('retrieve rows with auto-paging', async () => {
    await runTestWithRetryWhenFailing(async () => {
      const result = await client.sequences.retrieveRows({
        externalId: sequences[1].externalId!,
        limit: 1
      }).autoPagingToArray({ limit: 2 });
      expect(result.map(({values}) => values)).toEqual([values, values]);
    });
  });

  test('retrieve rows', async () => {
    const result = await client.sequences.retrieveRows({
      externalId: sequences[1].externalId!,
      limit: 2
    })
    expect(result.items[0].values).toEqual(values);
    expect(result.items.length).toBe(2);
    expect(result.next).toBeDefined();
    const nextResult = await result.next!();
    expect(nextResult.items.length).toBe(1);
  });

  test('delete', async () => {
    const result = await client.sequences.delete([
      { id: sequences[0].id },
      { externalId: sequences[1].externalId! },
    ]);
    expect(result).toEqual({});
  });
});
