// Copyright 2026 Cognite AS

import type { TimeSeries, TimeSeriesAPI, Unit, UnitsAPI } from '@cognite/sdk';
import type { CDFHttpClient } from '@cognite/sdk-core';
import { CogniteError, MetadataMap } from '@cognite/sdk-core';
import { describe, expect, it, vi } from 'vitest';
import { BetaDataPointsAPI } from '../../api/dataPoints/dataPointsApi';
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

const numericTs = (overrides: Partial<TimeSeries>): TimeSeries =>
  ({
    isString: false,
    type: 'numeric',
    ...overrides,
  }) as TimeSeries;

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

  it('does not call insert for empty items', async () => {
    const retrieve = vi.fn();
    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: vi.fn() },
    });
    const insertSpy = vi.spyOn(api, 'insert');

    await expect(api.insertWithUnitConversion([])).resolves.toEqual({});
    expect(retrieve).not.toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('converts values and dedupes timeseries.retrieve for repeated ids', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      numericTs({
        id: 1,
        unitExternalId: 'q:dst',
        externalId: 'ts-a',
      }),
    ]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'q:src',
        quantity: 'Q',
        conversion: { multiplier: 2, offset: 0 },
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
    const insertSpy = vi.spyOn(api, 'insert').mockResolvedValue({});

    const items: DatapointsInsertWithUnitItem[] = [
      {
        id: 1,
        unit: { externalId: 'q:src' },
        datapoints: [{ timestamp: 1, value: 5 }],
      },
      {
        id: 1,
        unit: { externalId: 'q:src' },
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
      { id: 1, datapoints: [{ timestamp: 1, value: 1 }] },
      { id: 1, datapoints: [{ timestamp: 2, value: 1 }] },
    ]);
  });

  it('dedupes retrieve ids for id vs externalId of same series', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      numericTs({
        id: 42,
        externalId: 'same-ts',
        unitExternalId: 'q:dst',
      }),
    ]);
    const unitsRetrieve = vi
      .fn()
      .mockResolvedValue([
        baseUnit({ externalId: 'q:src', quantity: 'Q' }),
        baseUnit({ externalId: 'q:dst', quantity: 'Q' }),
      ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    vi.spyOn(api, 'insert').mockResolvedValue({});

    await api.insertWithUnitConversion([
      {
        id: 42,
        unit: { externalId: 'q:src' },
        datapoints: [{ timestamp: 1, value: 100 }],
      },
      {
        externalId: 'same-ts',
        unit: { externalId: 'q:src' },
        datapoints: [{ timestamp: 2, value: 100 }],
      },
    ]);

    expect(retrieve).toHaveBeenCalledTimes(1);
    expect(unitsRetrieve).toHaveBeenCalledTimes(1);
  });

  it('throws when time series type is not numeric', async () => {
    const retrieve = vi
      .fn()
      .mockResolvedValue([
        { id: 7, isString: true, type: 'string' } as TimeSeries,
      ]);
    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: vi.fn().mockResolvedValue([]) },
    });

    await expect(
      api.insertWithUnitConversion([
        {
          id: 7,
          unit: { externalId: 'q:src' },
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(/only supports numeric time series/);
  });

  it('throws when time series has no unitExternalId', async () => {
    const retrieve = vi.fn().mockResolvedValue([numericTs({ id: 7 })]);
    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: vi.fn().mockResolvedValue([]) },
    });

    await expect(
      api.insertWithUnitConversion([
        {
          id: 7,
          unit: { externalId: 'q:src' },
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(CogniteError);
  });

  it('throws on quantity mismatch', async () => {
    const retrieve = vi
      .fn()
      .mockResolvedValue([numericTs({ id: 1, unitExternalId: 'temp:dst' })]);
    const unitsRetrieve = vi
      .fn()
      .mockResolvedValue([
        baseUnit({ externalId: 'press:src', quantity: 'Pressure' }),
        baseUnit({ externalId: 'temp:dst', quantity: 'Temperature' }),
      ]);
    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });

    await expect(
      api.insertWithUnitConversion([
        {
          id: 1,
          unit: { externalId: 'press:src' },
          datapoints: [{ timestamp: 1, value: 1 }],
        },
      ])
    ).rejects.toThrow(/Incompatible units/);
  });

  it('passes through values unchanged when unit.externalId equals stored unit', async () => {
    const retrieve = vi
      .fn()
      .mockResolvedValue([numericTs({ id: 1, unitExternalId: 'q:unit' })]);
    const unitsRetrieve = vi.fn().mockResolvedValue([
      baseUnit({
        externalId: 'q:unit',
        quantity: 'Q',
        conversion: { multiplier: 2, offset: 3 },
      }),
    ]);

    const api = makeApi({
      timeSeries: { retrieve },
      units: { retrieve: unitsRetrieve },
    });
    const insertSpy = vi.spyOn(api, 'insert').mockResolvedValue({});

    await api.insertWithUnitConversion([
      {
        id: 1,
        unit: { externalId: 'q:unit' },
        datapoints: [{ timestamp: 1, value: 42 }],
      },
    ]);

    expect(insertSpy).toHaveBeenCalledWith([
      { id: 1, datapoints: [{ timestamp: 1, value: 42 }] },
    ]);
  });
});
