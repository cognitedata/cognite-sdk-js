// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { isUnknownDebugNotice } from '../../index';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const knownNotice = {
  category: 'filtering',
  code: 'unfilteredContainerScan',
  grade: 'D',
  hint: 'Add a filter.',
  level: 'warning',
  resultExpression: 'result_set_1',
} as const;

const queryRequest = {
  with: { result_set_1: { nodes: {} } },
  select: { result_set_1: {} },
  debug: {},
};

const interceptInstancesPost = (path: string, notices: object[]) =>
  nock(mockBaseUrl)
    .post((uri) => uri.endsWith(`/models/instances${path}`))
    .reply(200, {
      items: { result_set_1: [] },
      nextCursor: {},
      debug: { notices },
    });

describe('Instances unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  describe('debug notices', () => {
    test('known (category, code) pairs are passed through untouched', async () => {
      interceptInstancesPost('/query', [knownNotice]);

      const response = await client.instances.query(queryRequest);

      expect(response.debug?.notices).toEqual([knownNotice]);
      const [notice] = response.debug?.notices ?? [];
      expect(notice && isUnknownDebugNotice(notice)).toBe(false);
    });

    test('an unknown code falls back to UnknownDebugNotice, keeping extra fields in data', async () => {
      interceptInstancesPost('/query', [
        {
          category: 'filtering',
          code: 'someFutureNotice',
          hint: 'Do something.',
          level: 'info',
          grade: 'A',
          resultExpression: 'result_set_1',
        },
      ]);

      const response = await client.instances.query(queryRequest);

      expect(response.debug?.notices).toEqual([
        {
          category: 'filtering',
          code: 'someFutureNotice',
          hint: 'Do something.',
          level: 'info',
          data: { grade: 'A', resultExpression: 'result_set_1' },
        },
      ]);
      const [notice] = response.debug?.notices ?? [];
      expect(notice && isUnknownDebugNotice(notice)).toBe(true);
    });

    test('a known code under an unknown category falls back to UnknownDebugNotice', async () => {
      interceptInstancesPost('/query', [
        { ...knownNotice, category: 'someFutureCategory' },
      ]);

      const response = await client.instances.query(queryRequest);

      const [notice] = response.debug?.notices ?? [];
      expect(notice && isUnknownDebugNotice(notice)).toBe(true);
    });

    test('a notice without code/category is kept as UnknownDebugNotice instead of throwing', async () => {
      interceptInstancesPost('/sync', [{ hint: 'h' }]);

      const response = await client.instances.sync(queryRequest);

      expect(response.debug?.notices).toEqual([
        {
          category: 'MISSING/UNKNOWN',
          code: 'MISSING/UNKNOWN',
          hint: 'h',
          level: 'MISSING/UNKNOWN',
          data: {},
        },
      ]);
    });

    test('known and unknown notices are mapped independently and in order', async () => {
      interceptInstancesPost('/query', [
        knownNotice,
        { category: 'x', code: 'y', hint: 'z', level: 'info', extra: 1 },
      ]);

      const response = await client.instances.query(queryRequest);

      const notices = response.debug?.notices ?? [];
      expect(notices.map((n) => isUnknownDebugNotice(n))).toEqual([
        false,
        true,
      ]);
    });

    test('responses without debug are returned as-is', async () => {
      nock(mockBaseUrl)
        .post((uri) => uri.endsWith('/models/instances/query'))
        .reply(200, { items: { result_set_1: [] }, nextCursor: {} });

      const response = await client.instances.query(queryRequest);

      expect(response.debug).toBeUndefined();
    });
  });
});
