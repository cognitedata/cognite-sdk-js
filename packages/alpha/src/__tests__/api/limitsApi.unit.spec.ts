// Copyright 2025 Cognite AS

import type { LimitAdvanceFilter } from 'alpha/src/types';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

describe('Limits API unit tests', () => {
  let client: CogniteClientAlpha;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  describe('retrieveByLimitId', () => {
    test('should retrieve a single limit by ID', async () => {
      const limitId = 'streams.properties';
      const mockedResponse = {
        limitId: 'streams.properties',
        value: 1000,
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values\/streams\.properties/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByLimitId(limitId);
      expect(result.limitId).toEqual(mockedResponse.limitId);
      expect(result.value).toEqual(mockedResponse.value);
    });

    test('should handle URL encoding for special characters in limitId', async () => {
      const limitId = 'streams.properties/special';
      const mockedResponse = {
        limitId: 'streams.properties/special',
        value: 500,
      };

      nock(mockBaseUrl)
        .get(
          /\/api\/v1\/projects\/.*\/limits\/values\/streams\.properties%2Fspecial$/
        )
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByLimitId(limitId);
      expect(result.limitId).toEqual(mockedResponse.limitId);
      expect(result.value).toEqual(mockedResponse.value);
    });

    test('should handle 404 error when limit not found', async () => {
      const limitId = 'non-existent-limit';

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values\/non-existent-limit$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(404, { error: { message: 'Limit not found', code: 404 } });

      await expect(client.limits.retrieveByLimitId(limitId)).rejects.toThrow();
    });
  });

  describe('retrieveByAdvancedFilter', () => {
    test('should retrieve limits with filter', async () => {
      const filter: LimitAdvanceFilter = {
        filter: {
          prefix: {
            property: ['limitId'],
            value: 'streams.properties',
          },
        },
        limit: 100,
      };
      const mockedResponse = {
        items: [
          {
            limitId: 'streams.properties',
            value: 1000,
          },
          {
            limitId: 'events.max',
            value: 5000,
          },
        ],
        nextCursor: 'cursor-123',
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/limits\/values\/list/, (body) => {
          return (
            body.filter?.prefix?.property?.includes('limitId') &&
            body.filter?.prefix?.value === 'streams.properties' &&
            body.limit === 100
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByAdvancedFilter(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.nextCursor).toBe('cursor-123');
      expect(result.items.length).toBe(2);
    });

    test('should retrieve limits with empty filter', async () => {
      const filter = {};
      const mockedResponse = {
        items: [
          {
            limitId: 'streams.properties',
            value: 1000,
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/limits\/values\/list/, filter)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByAdvancedFilter(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.items.length).toBe(1);
    });

    test('should handle empty results', async () => {
      const filter: LimitAdvanceFilter = {
        filter: {
          prefix: {
            property: ['limitId'],
            value: 'unexistent',
          },
        },
      };
      const mockedResponse = {
        items: [],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/limits\/values\/list/, (body) => {
          return (
            body.filter?.prefix?.property?.includes('limitId') &&
            body.filter?.prefix?.value === 'unexistent'
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByAdvancedFilter(filter);
      expect(result.items).toEqual([]);
      expect(result.items.length).toBe(0);
    });

    test('should handle pagination with cursor', async () => {
      const filter = {
        filter: {},
        cursor: 'cursor-123',
        limit: 50,
      };
      const mockedResponse = {
        items: [
          {
            limitId: 'streams.properties',
            value: 1000,
          },
        ],
        nextCursor: 'cursor-456',
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/limits\/values\/list/, filter)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.retrieveByAdvancedFilter(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.nextCursor).toBe('cursor-456');
    });
  });

  describe('getAllLimits', () => {
    test('should retrieve all limits without query params', async () => {
      const mockedResponse = {
        items: [
          {
            limitId: 'streams.properties',
            value: 1000,
          },
          {
            limitId: 'events.max',
            value: 5000,
          },
          {
            limitId: 'assets.max',
            value: 10000,
          },
        ],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.getAllLimits({});
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.items.length).toBe(3);
    });

    test('should retrieve all limits with query params', async () => {
      const queryParams = {
        limit: 100,
        cursor: 'initial-cursor',
      };
      const mockedResponse = {
        items: [
          {
            limitId: 'streams.properties',
            value: 1000,
          },
        ],
        nextCursor: 'next-cursor',
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values/)
        .query(queryParams)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.getAllLimits(queryParams);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.nextCursor).toBe('next-cursor');
    });

    test('should handle empty results', async () => {
      const mockedResponse = {
        items: [],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.limits.getAllLimits({});
      expect(result.items).toEqual([]);
      expect(result.items.length).toBe(0);
    });

    test('should handle error responses', async () => {
      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(500, { error: { message: 'Internal server error', code: 500 } });

      await expect(client.limits.getAllLimits({})).rejects.toThrow();
    });
  });

  describe('headers', () => {
    test('should include cdf-version header in all requests', async () => {
      const limitId = 'streams.properties';
      const mockedResponse = {
        limitId: 'streams.properties',
        value: 1000,
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/limits\/values\/streams\.properties/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      await client.limits.retrieveByLimitId(limitId);
    });
  });
});
