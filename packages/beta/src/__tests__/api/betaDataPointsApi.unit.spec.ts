// Copyright 2026 Cognite AS

import type { TimeSeries, TimeSeriesAPI, Unit, UnitsAPI } from '@cognite/sdk';
import type { CDFHttpClient } from '@cognite/sdk-core';
import { CogniteError, MetadataMap } from '@cognite/sdk-core';
import { describe, expect, it, vi } from 'vitest';
import {
  BetaDataPointsAPI,
  convertBetweenUnitConversions,
} from '../../api/dataPoints/dataPointsApi';
import type { DatapointsInsertWithUnitItem } from '../../api/dataPoints/types';

const baseUnit = (overrides: Partial<Unit>): Unit => ({
  externalId: 'q:base',
  name: 'BASE',
  longName: 'base',
  symbol: 'b',
  aliasNames: [],
  quantity: 'Q',
  conversion: { multiplier: 1, offset: 0 },
  ...overrides,
});

describe('convertBetweenUnitConversions', () => {
  it('converts °F to °C', () => {
    const fahrenheit = { multiplier: 5 / 9, offset: 459.67 };
    const celsius = { multiplier: 1, offset: 273.15 };
    expect(convertBetweenUnitConversions(212, fahrenheit, celsius)).toBeCloseTo(
      100,
      9
    );
    expect(convertBetweenUnitConversions(32, fahrenheit, celsius)).toBeCloseTo(
      0,
      9
    );
  });

  it('returns same value when factors match', () => {
    const c = { multiplier: 1, offset: 0 };
    expect(convertBetweenUnitConversions(3.5, c, c)).toBe(3.5);
  });
});

describe('BetaDataPointsAPI.insertWithUnitConversion', () => {
  const map = new MetadataMap();
  const noop = async () =>
    ({ data: {}, headers: {}, status: 200 }) as Awaited<
      ReturnType<CDFHttpClient['get']>
    >;
  const http = {
    get: vi.fn(noop),
    post: vi.fn(noop),
    patch: vi.fn(noop),
    put: vi.fn(noop),
    delete: vi.fn(noop),
  } as unknown as CDFHttpClient;

  function makeApi(mocks: {
    timeSeries: Pick<TimeSeriesAPI, 'retrieve'>;
    units: Pick<UnitsAPI, 'retrieve'>;
  }) {
    return new BetaDataPointsAPI(
      'https://example/api/v1/projects/p/timeseries/data',
      http,
      map,
      mocks.timeSeries as TimeSeriesAPI,
      mocks.units as UnitsAPI
    );
  }

  it('dedupes timeseries.retrieve for repeated ids', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 1,
        isString: false,
        unitExternalId: 'q:dst',
        externalId: 'ts-a',
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const unitsRetrieve = vi
      .fn()
      .mockImplementation(async (ids: { externalId: string }[]) => {
        const extIds = new Set(ids.map((i) => i.externalId));
        const out: Unit[] = [];
        if (extIds.has('q:src')) {
          out.push(
            baseUnit({
              externalId: 'q:src',
              quantity: 'Q',
              conversion: { multiplier: 2, offset: 0 },
            })
          );
        }
        if (extIds.has('q:dst')) {
          out.push(
            baseUnit({
              externalId: 'q:dst',
              quantity: 'Q',
              conversion: { multiplier: 10, offset: 0 },
            })
          );
        }
        return out;
      });

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    const insertSpy = vi.spyOn(api, 'insert').mockResolvedValue({});

    const items: DatapointsInsertWithUnitItem[] = [
      {
        id: 1,
        sourceUnit: 'q:src',
        datapoints: [{ timestamp: 1, value: 5 }],
      },
      {
        id: 1,
        sourceUnit: 'q:src',
        datapoints: [{ timestamp: 2, value: 5 }],
      },
    ];

    await api.insertWithUnitConversion(items);

    expect(retrieve).toHaveBeenCalledTimes(1);
    expect(retrieve).toHaveBeenCalledWith([{ id: 1 }], {
      ignoreUnknownIds: false,
    });
    expect(unitsRetrieve).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledWith([
      {
        id: 1,
        datapoints: [{ timestamp: 1, value: 1 }],
      },
      {
        id: 1,
        datapoints: [{ timestamp: 2, value: 1 }],
      },
    ]);
  });

  it('dedupes retrieve ids for id vs externalId of same series', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 42,
        externalId: 'same-ts',
        isString: false,
        unitExternalId: 'q:dst',
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'q:src',
        quantity: 'Q',
        conversion: { multiplier: 1, offset: 0 },
      }),
      baseUnit({
        externalId: 'q:dst',
        quantity: 'Q',
        conversion: { multiplier: 10, offset: 0 },
      }),
    ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    vi.spyOn(api, 'insert').mockResolvedValue({});

    await api.insertWithUnitConversion([
      {
        id: 42,
        sourceUnit: 'q:src',
        datapoints: [{ timestamp: 1, value: 100 }],
      },
      {
        externalId: 'same-ts',
        sourceUnit: 'q:src',
        datapoints: [{ timestamp: 2, value: 100 }],
      },
    ]);

    expect(retrieve).toHaveBeenCalledTimes(1);
    const arg = retrieve.mock.calls[0][0] as {
      id?: number;
      externalId?: string;
    }[];
    expect(arg).toHaveLength(2);
    expect(unitsRetrieve).toHaveBeenCalledTimes(1);
  });

  it('throws when time series has no unitExternalId', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 7,
        isString: false,
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: vi.fn().mockResolvedValue([]) },
    });
    vi.spyOn(api, 'insert');

    await expect(
      api.insertWithUnitConversion([
        {
          id: 7,
          sourceUnit: 'q:src',
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(CogniteError);
  });

  it('throws on quantity mismatch', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 1,
        isString: false,
        unitExternalId: 'temp:dst',
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'press:src',
        quantity: 'Pressure',
        conversion: { multiplier: 1, offset: 0 },
      }),
      baseUnit({
        externalId: 'temp:dst',
        quantity: 'Temperature',
        conversion: { multiplier: 1, offset: 0 },
      }),
    ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    vi.spyOn(api, 'insert');

    await expect(
      api.insertWithUnitConversion([
        {
          id: 1,
          sourceUnit: 'press:src',
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(/Incompatible units/);
  });

  it('throws on string datapoint value', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 1,
        isString: false,
        unitExternalId: 'q:dst',
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'q:src',
        quantity: 'Q',
        conversion: { multiplier: 1, offset: 0 },
      }),
      baseUnit({
        externalId: 'q:dst',
        quantity: 'Q',
        conversion: { multiplier: 1, offset: 0 },
      }),
    ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    vi.spyOn(api, 'insert');

    await expect(
      api.insertWithUnitConversion([
        {
          id: 1,
          sourceUnit: 'q:src',
          datapoints: [{ timestamp: 1, value: 'x' }],
        },
      ])
    ).rejects.toThrow(/string datapoint/);
  });

  it('throws when source unit is missing from catalog response', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        id: 1,
        isString: false,
        unitExternalId: 'q:dst',
      } satisfies Partial<TimeSeries> as TimeSeries,
    ]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'q:dst',
        quantity: 'Q',
        conversion: { multiplier: 1, offset: 0 },
      }),
    ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    vi.spyOn(api, 'insert');

    await expect(
      api.insertWithUnitConversion([
        {
          id: 1,
          sourceUnit: 'q:src',
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(/Unknown unit externalId/);
  });
});
