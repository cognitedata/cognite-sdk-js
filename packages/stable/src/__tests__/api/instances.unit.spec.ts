// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type CogniteClient from '../../cogniteClient';
import { isKnownDebugNotice } from '../../index';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const knownNotice = {
  category: 'filtering',
  code: 'unfilteredContainerScan',
  grade: 'D',
  hint: 'Add a filter.',
  level: 'warning',
  resultExpression: 'result_set_1',
};

const futureNotice = {
  category: 'filtering',
  code: 'someFutureNotice',
  grade: 'A',
  hint: 'Do something.',
  level: 'info',
  resultExpression: 'result_set_1',
};

const queryRequest = {
  with: { result_set_1: { nodes: {} } },
  select: { result_set_1: {} },
  debug: {},
};

describe('Instances unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  describe('debug notices', () => {
    test('responses are returned exactly as the API sent them', async () => {
      nock(mockBaseUrl)
        .post((uri) => uri.endsWith('/models/instances/query'))
        .reply(200, {
          items: { result_set_1: [] },
          nextCursor: {},
          debug: { notices: [knownNotice, futureNotice] },
        });

      const response = await client.instances.query(queryRequest);

      expect(response.debug?.notices).toEqual([knownNotice, futureNotice]);
    });

    test('isKnownDebugNotice accepts a known (category, code) pair', () => {
      expect(isKnownDebugNotice(knownNotice)).toBe(true);
    });

    test('isKnownDebugNotice rejects an unknown code', () => {
      expect(isKnownDebugNotice(futureNotice)).toBe(false);
    });

    test('isKnownDebugNotice rejects a known code under an unknown category', () => {
      expect(
        isKnownDebugNotice({ ...knownNotice, category: 'someFutureCategory' })
      ).toBe(false);
    });

    test('isKnownDebugNotice is not fooled by inherited object properties', () => {
      expect(
        isKnownDebugNotice({
          category: 'constructor',
          code: '',
          hint: '',
          level: '',
        })
      ).toBe(false);
    });
  });
});
