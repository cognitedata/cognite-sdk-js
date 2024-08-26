// Copyright 2020 Cognite AS

import nock from 'nock';
import { beforeAll, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { type Sequence, SequenceValueType } from '../../types';
import { mockBaseUrl, randomInt, setupMockableClient } from '../testUtils';

describe('Sequences unit test', () => {
  let mockedClient: CogniteClient;
  const testValues = [1, 1.5, 'two'];
  const testExternalId = `sequence${randomInt()}`;
  const now = new Date(Date.now());
  const sequence: Sequence = {
    id: 4782634,
    assetId: 569463856748,
    name: 'sequence1',
    description: 'description',
    externalId: testExternalId,
    lastUpdatedTime: now,
    createdTime: now,
    columns: [
      {
        id: 345894,
        externalId: 'one',
        valueType: SequenceValueType.LONG,
        lastUpdatedTime: now,
        createdTime: now,
      },
      {
        id: 345891234,
        externalId: 'one_and_a_half',
        valueType: SequenceValueType.DOUBLE,
        lastUpdatedTime: now,
        createdTime: now,
      },
      {
        id: 345435894,
        externalId: 'two',
        valueType: SequenceValueType.STRING,
        lastUpdatedTime: now,
        createdTime: now,
      },
    ],
  };
  const testRows = new Array(3).fill(null).map((_, i) => ({
    rowNumber: i,
    values: testValues,
  }));
  const mockedResponse = {
    nextCursor: 'fs7kggsd7yu4f',
    externalId: sequence.externalId,
    columns: sequence.columns,
    rows: testRows,
    id: sequence.id,
  };

  beforeAll(async () => {
    mockedClient = setupMockableClient();
    nock.cleanAll();
  });

  test('retrieve rows', async () => {
    nock(mockBaseUrl)
      .post(/\/sequences\/data\/list/, {
        externalId: testExternalId,
      })
      .once()
      .reply(200, mockedResponse);

    const { items, next } = await mockedClient.sequences.retrieveRows({
      externalId: testExternalId,
    });

    expect(items.length).toBe(3);
    items.forEach((row, index) => {
      expect(row.values).toEqual(testValues);
      expect(row.columns.length).toEqual(3);
      expect(row.rowNumber).toEqual(index);
    });
    expect(typeof next).toBe('function');
  });
});
