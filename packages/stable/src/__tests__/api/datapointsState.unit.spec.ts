// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type { CogniteClient } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

describe('State time series datapoints unit test', () => {
  let client: CogniteClient;
  const instanceId = { space: 'my-space', externalId: 'my-state-ts' };

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('insert passes numericValue and stringValue through', async () => {
    const datapoints = [
      { timestamp: 1000, numericValue: 0 },
      { timestamp: 2000, stringValue: 'OPEN' },
      { timestamp: 3000, numericValue: 0, stringValue: 'CLOSED' },
    ];
    nock(mockBaseUrl)
      .post(/\/timeseries\/data$/, { items: [{ instanceId, datapoints }] })
      .once()
      .reply(200, {});
    await client.datapoints.insert([{ instanceId, datapoints }]);
    expect(nock.isDone()).toBe(true);
  });

  test('retrieve returns state datapoints with Date timestamps', async () => {
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/list$/)
      .once()
      .reply(200, {
        items: [
          {
            id: 1,
            instanceId,
            isString: false,
            type: 'state',
            datapoints: [
              { timestamp: 1000, numericValue: 1, stringValue: 'OPEN' },
              { timestamp: 2000, numericValue: 7 },
            ],
          },
        ],
      });
    const [response] = await client.datapoints.retrieve({
      items: [{ instanceId }],
    });
    expect(response.type).toBe('state');
    if (response.type !== 'state') return;
    expect(response.datapoints).toEqual([
      { timestamp: new Date(1000), numericValue: 1, stringValue: 'OPEN' },
      { timestamp: new Date(2000), numericValue: 7 },
    ]);
  });
});
