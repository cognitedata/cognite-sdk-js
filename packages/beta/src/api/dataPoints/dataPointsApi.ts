// Copyright 2026 Cognite AS

import { DataPointsAPI } from '@cognite/sdk';
import type {
  DatapointWrite,
  DatapointsInsertItem,
  TimeSeries,
  TimeSeriesAPI,
  Unit,
  UnitConversion,
  UnitsAPI,
} from '@cognite/sdk';
import type {
  CDFHttpClient,
  CogniteExternalId,
  IdEitherWithInstance,
  MetadataMap,
} from '@cognite/sdk-core';
import { CogniteError } from '@cognite/sdk-core';
import type { DatapointsInsertWithUnitItem } from './types';

const CONVERSION_SIG_DIGITS = 12;

function roundToSigDigits(value: number, digits: number): number {
  if (value === 0) return 0;
  const factor = 10 ** (digits - Math.floor(Math.log10(Math.abs(value))) - 1);
  return Math.round(value * factor) / factor;
}

/** @hidden */
export function convertBetweenUnitConversions(
  value: number,
  src: UnitConversion,
  dst: UnitConversion
): number {
  if (src.multiplier === dst.multiplier && src.offset === dst.offset) {
    return value;
  }
  const base = (value + src.offset) * src.multiplier;
  return roundToSigDigits(
    base / dst.multiplier - dst.offset,
    CONVERSION_SIG_DIGITS
  );
}

function timeSeriesLookupKeys(ts: TimeSeries): string[] {
  const keys: string[] = [];
  if (ts.id != null) {
    keys.push(`id:${ts.id}`);
  }
  if (ts.externalId != null && ts.externalId !== '') {
    keys.push(`ext:${ts.externalId}`);
  }
  if (ts.instanceId != null) {
    keys.push(`inst:${ts.instanceId.space}:${ts.instanceId.externalId}`);
  }
  return keys;
}

function insertItemLookupKey(item: DatapointsInsertWithUnitItem): string {
  if ('id' in item) {
    return `id:${item.id}`;
  }
  if ('externalId' in item) {
    return `ext:${item.externalId}`;
  }
  return `inst:${item.instanceId.space}:${item.instanceId.externalId}`;
}

function toRetrieveId(
  item: DatapointsInsertWithUnitItem
): IdEitherWithInstance {
  if ('id' in item) {
    return { id: item.id };
  }
  if ('externalId' in item) {
    return { externalId: item.externalId };
  }
  return { instanceId: item.instanceId };
}

function retrieveIdKey(id: IdEitherWithInstance): string {
  if ('id' in id) return `id:${id.id}`;
  if ('externalId' in id) return `ext:${id.externalId}`;
  return `inst:${id.instanceId.space}:${id.instanceId.externalId}`;
}

/**
 * Beta extension of {@link DataPointsAPI} with unit-aware insert.
 */
export class BetaDataPointsAPI extends DataPointsAPI {
  constructor(
    resourcePath: string,
    httpClient: CDFHttpClient,
    map: MetadataMap,
    private readonly timeSeriesApi: TimeSeriesAPI,
    private readonly unitsApi: UnitsAPI
  ) {
    super(resourcePath, httpClient, map);
  }

  /**
   * Insert datapoints after converting numeric values from `sourceUnit` to each time
   * series' stored `unitExternalId` (resolved via {@link TimeSeriesAPI.retrieve}).
   * Fetches unit definitions with {@link UnitsAPI.retrieve}.
   * String datapoint values are not supported.
   */
  public insertWithUnitConversion = async (
    items: DatapointsInsertWithUnitItem[]
  ): Promise<object> => {
    const converted = await this.convertInsertItemsWithUnit(items);
    return this.insert(converted);
  };

  private async convertInsertItemsWithUnit(
    items: DatapointsInsertWithUnitItem[]
  ): Promise<DatapointsInsertItem[]> {
    if (items.length === 0) {
      return [];
    }

    const retrieveIds = dedupeRetrieveIds(items.map(toRetrieveId));
    const timeSeriesList = await this.timeSeriesApi.retrieve(retrieveIds, {
      ignoreUnknownIds: false,
    });

    const unitByTsKey = new Map<string, CogniteExternalId>();
    for (const ts of timeSeriesList) {
      const unitExternalId = ts.unitExternalId;
      if (unitExternalId == null || unitExternalId === '') {
        throw new CogniteError(
          `Time series is missing unitExternalId (required for insertWithUnitConversion). Time series id=${ts.id}, externalId=${ts.externalId ?? 'n/a'}`,
          400
        );
      }
      for (const key of timeSeriesLookupKeys(ts)) {
        unitByTsKey.set(key, unitExternalId);
      }
    }

    const unitExternalIdsToLoad = new Set<string>();
    for (const item of items) {
      const key = insertItemLookupKey(item);
      const targetUnit = unitByTsKey.get(key);
      if (targetUnit == null) {
        throw new CogniteError(
          `Time series not found in retrieve response for insert item (key=${key})`,
          400
        );
      }
      unitExternalIdsToLoad.add(item.sourceUnit);
      unitExternalIdsToLoad.add(targetUnit);
    }

    const unitIds = [...unitExternalIdsToLoad].map((externalId) => ({
      externalId,
    }));
    const unitsList = await this.unitsApi.retrieve(unitIds);
    const unitByExternalId = new Map<string, Unit>();
    for (const u of unitsList) {
      unitByExternalId.set(u.externalId, u);
    }

    for (const extId of unitExternalIdsToLoad) {
      if (!unitByExternalId.has(extId)) {
        throw new CogniteError(
          `Unknown unit externalId in unit catalog: ${extId}`,
          400
        );
      }
    }

    const result: DatapointsInsertItem[] = [];
    for (const item of items) {
      const key = insertItemLookupKey(item);
      const targetUnitExternalId = unitByTsKey.get(key) as CogniteExternalId;
      const srcUnit = unitByExternalId.get(item.sourceUnit) as Unit;
      const dstUnit = unitByExternalId.get(targetUnitExternalId) as Unit;

      if (srcUnit.quantity !== dstUnit.quantity) {
        throw new CogniteError(
          `Incompatible units for conversion: sourceUnit=${item.sourceUnit} (quantity=${srcUnit.quantity}) vs time series unit=${targetUnitExternalId} (quantity=${dstUnit.quantity})`,
          400
        );
      }

      const convertedDatapoints: DatapointWrite[] = item.datapoints.map(
        (dp: DatapointWrite) => {
          if (typeof dp.value === 'string') {
            throw new CogniteError(
              'insertWithUnitConversion does not support string datapoint values',
              400
            );
          }
          const newValue = convertBetweenUnitConversions(
            dp.value,
            srcUnit.conversion,
            dstUnit.conversion
          );
          return { ...dp, value: newValue };
        }
      );

      const { sourceUnit: _ignored, ...rest } = item;
      result.push({
        ...rest,
        datapoints: convertedDatapoints,
      } as DatapointsInsertItem);
    }

    return result;
  }
}

function dedupeRetrieveIds(
  ids: IdEitherWithInstance[]
): IdEitherWithInstance[] {
  const seen = new Map<string, IdEitherWithInstance>();
  for (const id of ids) {
    const key = retrieveIdKey(id);
    if (!seen.has(key)) seen.set(key, id);
  }
  return [...seen.values()];
}
