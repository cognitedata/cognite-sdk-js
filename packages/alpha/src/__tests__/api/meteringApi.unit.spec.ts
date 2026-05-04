// Copyright 2026 Cognite AS

import type { MeterConsumptionFilterQuery } from 'alpha/src/types';
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

  describe('listMeters', () => {
    test('should filter meters with prefix on meterId', async () => {
      const filter: MeterConsumptionFilterQuery = {
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

      const result = await client.metering.listMeters(filter);
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

      const result = await client.metering.listMeters(filter);
      expect(result.items).toEqual(mockedResponse.items);
      expect(result.items.length).toBe(1);
    });

    test('should handle empty filter results in retrieve all Meters', async () => {
      const filter: MeterConsumptionFilterQuery = {
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

      const result = await client.metering.listMeters(filter);
      expect(result.items).toEqual([]);
      expect(result.items.length).toBe(0);
    });

    test('should return historical datapoints for meters', async () => {
      const filter: MeterConsumptionFilterQuery = {
        filter: {
          prefix: {
            property: ['meterId'],
            value: 'atlas.',
          },
        },
        start: epochMs,
        end: epochMs + 2000,
        numberOfDatapoints: 10,
      };

      const mockedResponse = {
        items: [
          {
            meterId: 'atlas.monthly_ai_tokens',
            datapoints: [
              { timestamp: epochMs, value: 10 },
              { timestamp: epochMs + 1000, value: 20 },
            ],
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/list/, (body) => {
          return (
            body.filter?.prefix?.property?.includes('meterId') &&
            body.filter?.prefix?.value === 'atlas.'
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.listMeters(filter);
      expect(result.items[0].meterId).toBe('atlas.monthly_ai_tokens');
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.items[0].datapoints[1].timestamp).toEqual(
        new Date(epochMs + 1000)
      );
      expect(result.items[0].datapoints[0].value).toBe(10);
      expect(result.items[0].datapoints[1].value).toBe(20);
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

      const result = await client.metering.listMeters(filter);
      expect(result.items[0].meterId).toBe('functions.concurrent_executions');
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.nextCursor).toBe('cursor-456');
    });
  });

  describe('retrieveConsumptionData', () => {
    test('should retrieve single meter and parse datapoint timestamps', async () => {
      const mockedResponse = {
        items: [
          {
            meterId: 'atlas.monthly_ai_tokens',
            datapoints: [{ timestamp: epochMs, value: 10 }],
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/byids$/, (body) => {
          return (
            Array.isArray(body.items) &&
            body.items.length === 1 &&
            body.items[0].meterId === 'atlas.monthly_ai_tokens'
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveConsumptionData([
        'atlas.monthly_ai_tokens',
      ]);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.items[0].datapoints[0].value).toBe(10);
    });

    test('should retrieve multiple meters and parse datapoint timestamps', async () => {
      const mockedResponse = {
        items: [
          {
            meterId: 'atlas.monthly_ai_tokens',
            datapoints: [
              { timestamp: epochMs, value: 10 },
              { timestamp: epochMs + 1000, value: 20 },
            ],
          },
          {
            meterId: 'files.storage_bytes',
            datapoints: [{ timestamp: epochMs + 1000, value: 20 }],
          },
        ],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/byids$/, (body) => {
          return (
            Array.isArray(body.items) &&
            body.items.length === 2 &&
            body.items[0].meterId === 'atlas.monthly_ai_tokens' &&
            body.items[1].meterId === 'files.storage_bytes'
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      const result = await client.metering.retrieveConsumptionData([
        'atlas.monthly_ai_tokens',
        'files.storage_bytes',
      ]);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].datapoints[0].timestamp).toEqual(
        new Date(epochMs)
      );
      expect(result.items[0].datapoints[1].timestamp).toEqual(
        new Date(epochMs + 1000)
      );
      expect(result.items[1].datapoints[0].timestamp).toEqual(
        new Date(epochMs + 1000)
      );
      expect(result.items[0].datapoints[0].value).toBe(10);
      expect(result.items[1].datapoints[0].value).toBe(20);
    });

    test('should merge optional historical params into the request body', async () => {
      const mockedResponse = { items: [] };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/byids$/, (body) => {
          return (
            body.items?.length === 1 &&
            body.items[0].meterId === 'a' &&
            body.start === 1000 &&
            body.end === 2000 &&
            body.numberOfDatapoints === 10
          );
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      await client.metering.retrieveConsumptionData(['a'], {
        start: 1000,
        end: 2000,
        numberOfDatapoints: 10,
      });
    });
  });

  describe('headers', () => {
    test('should send cdf-version 20230101-alpha on metering requests', async () => {
      const meterId = 'atlas.monthly_ai_tokens';
      const mockedResponse = {
        items: [{ meterId, datapoints: [] }],
      };

      nock(mockBaseUrl)
        .post(/\/api\/v1\/projects\/.*\/metering\/meters\/byids$/, (body) => {
          return body.items?.length === 1 && body.items[0].meterId === meterId;
        })
        .matchHeader('cdf-version', '20230101-alpha')
        .reply(200, mockedResponse);

      await client.metering.retrieveConsumptionData([meterId]);
    });
  });
});
