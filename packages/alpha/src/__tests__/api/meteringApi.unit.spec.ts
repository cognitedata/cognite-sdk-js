// Copyright 2026 Cognite AS

import type { MeterConsumptionAdvancedFilter } from 'alpha/src/types';
import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import { mockBaseUrl } from '../../../../core/src/__tests__/testUtils';
import type CogniteClientAlpha from '../../cogniteClient';
import { setupMockableClient } from '../testUtils';

const epochMs = 1765203279461;

describe('Metering API unit tests', () => {
  let client: CogniteClientAlpha;

  beforeEach(() => {
    nock.cleanAll();
    client = setupMockableClient();
  });

  describe('retrieveByMeterId', () => {
    test('should retrieve consumption data for a single meter', async () => {
      const meterId = 'atlas.monthly_ai_tokens';
      const mockedResponse = {
        meterId: 'atlas.monthly_ai_tokens',
        datapoints: [],
      };

      nock(mockBaseUrl)
        .get(
          /\/api\/v1\/projects\/.*\/metering\/meters\/atlas\.monthly_ai_tokens$/
        )
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveByMeterId(meterId);
      expect(result.meterId).toEqual(mockedResponse.meterId);
      expect(result.datapoints).toEqual([]);
    });

    test('should convert datapoint timestamps from epoch ms to Date', async () => {
      const meterId = 'files.storage_bytes';
      const mockedResponse = {
        meterId: 'files.storage_bytes',
        datapoints: [{ timestamp: epochMs, value: 42.5 }],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters\/files\.storage_bytes$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveByMeterId(meterId);
      expect(result.datapoints).toHaveLength(1);
      expect(result.datapoints[0].value).toBe(42.5);
      expect(result.datapoints[0].timestamp).toEqual(new Date(epochMs));
    });

    test('should pass optional range query params', async () => {
      const meterId = 'atlas.monthly_ai_tokens';
      const query = {
        start: 1000,
        end: 2000,
        numberOfDatapoints: 3,
      };
      const mockedResponse = {
        meterId,
        datapoints: [{ timestamp: epochMs, value: 1 }],
      };

      nock(mockBaseUrl)
        .get(
          /\/api\/v1\/projects\/.*\/metering\/meters\/atlas\.monthly_ai_tokens$/
        )
        .query(query)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveByMeterId(meterId, query);
      expect(result.datapoints[0].timestamp).toEqual(new Date(epochMs));
    });

    test('should URL-encode special characters in meterId', async () => {
      const meterId = 'service/meter_name';
      const mockedResponse = {
        meterId: 'service/meter_name',
        datapoints: [],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters\/service%2Fmeter_name$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveByMeterId(meterId);
      expect(result.meterId).toEqual(mockedResponse.meterId);
    });

    test('should reject when meter is not found', async () => {
      const meterId = 'non.existent_meter';

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters\/non\.existent_meter$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(404, { error: { message: 'Meter not found', code: 404 } });

      await expect(
        client.metering.retrieveByMeterId(meterId)
      ).rejects.toThrow();
    });
  });

  describe('filterMeters', () => {
    test('should filter meters with prefix on meterId', async () => {
      const filter: MeterConsumptionAdvancedFilter = {
        filter: {
          prefix: {
            property: ['meterId'],
            value: 'atlas.',
          },
        },
        limit: 100,
      };
      const mockedResponse = {
        items: [
          {
            meterId: 'atlas.monthly_ai_tokens',
            datapoints: [],
          },
          {
            meterId: 'atlas.monthly_ai_prompts',
            datapoints: [],
          },
        ],
        nextCursor: 'cursor-123',
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/list/, (body) => {
          return (
            body.filter?.prefix?.property?.includes('meterId') &&
            body.filter?.prefix?.value === 'atlas.' &&
            body.limit === 100
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.filterMeters(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.nextCursor).toBe('cursor-123');
      expect(result.items.length).toBe(2);
    });

    test('should filter meters with empty body', async () => {
      const filter = {};
      const mockedResponse = {
        items: [
          {
            meterId: 'files.storage_bytes',
            datapoints: [],
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/list/, filter)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.filterMeters(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.items.length).toBe(1);
    });

    test('should handle empty filter results', async () => {
      const filter: MeterConsumptionAdvancedFilter = {
        filter: {
          prefix: {
            property: ['meterId'],
            value: 'no_such_prefix_',
          },
        },
      };
      const mockedResponse = {
        items: [],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/list/, (body) => {
          return (
            body.filter?.prefix?.property?.includes('meterId') &&
            body.filter?.prefix?.value === 'no_such_prefix_'
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.filterMeters(filter);
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
            meterId: 'functions.concurrent_executions',
            datapoints: [{ timestamp: epochMs, value: 2 }],
          },
        ],
        nextCursor: 'cursor-456',
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/list/, filter)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.filterMeters(filter);
      expect(result.items[0].meterId).toBe('functions.concurrent_executions');
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.nextCursor).toBe('cursor-456');
    });
  });

  describe('listMeters', () => {
    test('should list meters without query params', async () => {
      const mockedResponse = {
        items: [
          { meterId: 'atlas.monthly_ai_tokens', datapoints: [] },
          { meterId: 'files.storage_bytes', datapoints: [] },
        ],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.listMeters({});
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.items.length).toBe(2);
    });

    test('should list meters with query params', async () => {
      const queryParams = {
        limit: 100,
        cursor: 'initial-cursor',
        start: 1,
        end: 2,
        numberOfDatapoints: 5,
      };
      const mockedResponse = {
        items: [{ meterId: 'atlas.monthly_ai_tokens', datapoints: [] }],
        nextCursor: 'next-cursor',
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters$/)
        .query(queryParams)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.listMeters(queryParams);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.nextCursor).toBe('next-cursor');
    });

    test('should handle empty list', async () => {
      const mockedResponse = {
        items: [],
      };

      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.listMeters({});
      expect(result.items).toEqual([]);
      expect(result.items.length).toBe(0);
    });

    test('should propagate error responses', async () => {
      nock(mockBaseUrl)
        .get(/\/api\/v1\/projects\/.*\/metering\/meters$/)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(500, { error: { message: 'Internal server error', code: 500 } });

      await expect(client.metering.listMeters({})).rejects.toThrow();
    });
  });

  describe('retrieveByMeterIds', () => {
    test('should retrieve multiple meters and parse datapoint timestamps', async () => {
      const request = {
        items: [
          { meterId: 'atlas.monthly_ai_tokens' },
          { meterId: 'files.storage_bytes' },
        ],
      };
      const mockedResponse = {
        items: [
          {
            meterId: 'atlas.monthly_ai_tokens',
            datapoints: [{ timestamp: epochMs, value: 10 }],
          },
          {
            meterId: 'files.storage_bytes',
            datapoints: [{ timestamp: epochMs + 1000, value: 20 }],
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/byids$/, request)
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveByMeterIds(request);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.items[1].datapoints[0].timestamp).toEqual(
        new Date(epochMs + 1000)
      );
      expect(result.items[0].datapoints[0].value).toBe(10);
      expect(result.items[1].datapoints[0].value).toBe(20);
    });
  });

  describe('headers', () => {
    test('should send cdf-version 20230101-alpha on metering requests', async () => {
      const meterId = 'atlas.monthly_ai_tokens';
      const mockedResponse = {
        meterId,
        datapoints: [],
      };

      nock(mockBaseUrl)
        .get(
          /\/api\/v1\/projects\/.*\/metering\/meters\/atlas\.monthly_ai_tokens$/
        )
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      await client.metering.retrieveByMeterId(meterId);
    });
  });
});
