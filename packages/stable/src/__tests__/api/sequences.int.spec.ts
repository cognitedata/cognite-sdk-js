// Copyright 2020 Cognite AS

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import type { Asset } from '../../types';
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

const SLOW_INDEX_TEST_TIMEOUT_MS = 3 * 60 * 1000;
const RETRY_SLEEP_BUDGET_MS = SLOW_INDEX_TEST_TIMEOUT_MS - 30 * 1000;

describe('Sequences integration test', () => {
  let client: CogniteClient;
  let sequences: Sequence[];
  const testValues = [1, 1.5, 'two'];
  const testExternalId = `sequence${randomInt()}`;
  // A word that only this run's sequence carries, so the search test cannot be
  // satisfied or crowded out by sequences left behind by other runs.
  const searchWord = `sdksearch${randomInt()}`;
  const sequenceToCreate: ExternalSequence = {
    name: 'sequence1',
    description: `description ${searchWord}`,
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
    // Mutate in place: sequencesToCreate[0] references this object, so a
    // reassignment would leave the created sequence without the assetId the
    // filter tests depend on.
    sequenceToCreate.assetId = asset.id;
  });

  // Safety net: nothing created here may outlive the run, even if a test fails
  // midway. Without this the project accumulated hundreds of leaked sequences
  // and assets, which in turn made the search test flaky.
  afterAll(async () => {
    const ids = [
      ...(sequences ?? []).map(({ id }) => ({ id })),
      { externalId: testExternalId },
    ];
    await client.sequences.delete(ids).catch(() => undefined);
    if (asset) {
      await client.assets.delete([{ id: asset.id }]).catch(() => undefined);
    }
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

    // The asset filter and search indexes lag far behind sequence creation,
    // so these tests get a 3 minute budget instead of the default.
    test(
      'filter on assetIds',
      async () => {
        await runTestWithRetryWhenFailing(async () => {
          const { items } = await client.sequences.list({
            filter: { assetIds: [asset.id] },
            limit: 1,
          });
          expect(items[0].name).toBe(sequences[0].name);
        }, RETRY_SLEEP_BUDGET_MS);
      },
      SLOW_INDEX_TEST_TIMEOUT_MS
    );

    test(
      'filter on rootAssetIds',
      async () => {
        await runTestWithRetryWhenFailing(async () => {
          const { items } = await client.sequences.list({
            filter: { rootAssetIds: [asset.id] },
            limit: 1,
          });
          expect(items[0].name).toBe(sequences[0].name);
        }, RETRY_SLEEP_BUDGET_MS);
      },
      SLOW_INDEX_TEST_TIMEOUT_MS
    );

    test(
      'filter on assetSubtreeIds',
      async () => {
        await runTestWithRetryWhenFailing(async () => {
          const { items } = await client.sequences.list({
            filter: { assetSubtreeIds: [{ id: asset.id }] },
            limit: 1,
          });
          expect(items[0].name).toBe(sequences[0].name);
        }, RETRY_SLEEP_BUDGET_MS);
      },
      SLOW_INDEX_TEST_TIMEOUT_MS
    );
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

  // Must run before 'update', which replaces the description this searches for.
  test(
    'search',
    async () => {
      await runTestWithRetryWhenFailing(async () => {
        // The search endpoint matches whole words: wildcard patterns like
        // 'des*tion' never match anything. It does match fuzzily, though, so
        // a concurrent run's `sdksearch<other-int>` can show up too; only
        // require that this run's sequence is among the hits.
        const result = await client.sequences.search({
          search: {
            query: searchWord,
          },
        });
        expect(result.some((s) => s.id === sequences[0].id)).toBe(true);
      }, RETRY_SLEEP_BUDGET_MS);
    },
    SLOW_INDEX_TEST_TIMEOUT_MS
  );

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
