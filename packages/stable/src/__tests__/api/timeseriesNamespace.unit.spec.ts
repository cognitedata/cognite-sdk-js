// Copyright 2026 Cognite AS

import nock from 'nock';
import { beforeEach, describe, expect, test } from 'vitest';
import type { CogniteClient } from '../..';
import { mockBaseUrl, setupMockableClient } from '../testUtils';

const instanceId = { space: 'my-space', externalId: 'my-ts' };

describe('Time series namespace unit test', () => {
  let client: CogniteClient;

  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('timeseries.data exposes the same methods as datapoints', () => {
    for (const method of ['insert', 'retrieve', 'retrieveLatest', 'delete']) {
      expect(typeof client.timeseries.data[method as 'insert']).toBe(
        'function'
      );
      expect(typeof client.datapoints[method as 'insert']).toBe('function');
    }
  });

  test('timeseries.data.retrieve posts to /timeseries/data/list', async () => {
    const reply = {
      items: [
        {
          id: 1,
          instanceId,
          isString: false,
          isStep: false,
          datapoints: [{ timestamp: 1700000000000, value: 1 }],
        },
      ],
    };
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/list$/, { items: [{ instanceId }] })
      .once()
      .reply(200, reply);

    const result = await client.timeseries.data.retrieve({
      items: [{ instanceId }],
    });
    expect(result).toHaveLength(1);
    expect(result[0].datapoints[0].timestamp).toEqual(new Date(1700000000000));
  });

  test('timeseries.data.retrieveLatest posts to /timeseries/data/latest', async () => {
    nock(mockBaseUrl)
      .post(/\/timeseries\/data\/latest$/)
      .once()
      .reply(200, {
        items: [{ id: 1, instanceId, isString: false, datapoints: [] }],
      });

    const result = await client.timeseries.data.retrieveLatest([
      { instanceId },
    ]);
    expect(result).toHaveLength(1);
  });

  test('timeseries.synthetic.query posts to /timeseries/synthetic/query', async () => {
    const items = [{ expression: "TS{externalId='my-ts'} * 2", limit: 10 }];
    nock(mockBaseUrl)
      .post(/\/timeseries\/synthetic\/query$/, { items })
      .twice()
      .reply(200, {
        items: [
          {
            isString: false,
            datapoints: [{ timestamp: 1700000000000, value: 2 }],
          },
        ],
      });

    const viaNew = await client.timeseries.synthetic.query(items);
    const viaOld = await client.timeseries.syntheticQuery(items);
    expect(viaNew).toEqual(viaOld);
    expect(viaNew[0].datapoints[0].timestamp).toEqual(new Date(1700000000000));
  });
});
