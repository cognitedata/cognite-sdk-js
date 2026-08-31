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

type Identifier =
  | { kind: 'id'; id: number }
  | { kind: 'ext'; externalId: string }
  | { kind: 'inst'; space: string; externalId: string };

function identifierKey(i: Identifier): string {
  switch (i.kind) {
    case 'id':
      return `id:${i.id}`;
    case 'ext':
      return `ext:${i.externalId}`;
    case 'inst':
      return `inst:${i.space}:${i.externalId}`;
  }
}

function identifierToRetrieveId(i: Identifier): IdEitherWithInstance {
  switch (i.kind) {
    case 'id':
      return { id: i.id };
    case 'ext':
      return { externalId: i.externalId };
    case 'inst':
      return { instanceId: { space: i.space, externalId: i.externalId } };
  }
}

function toIdentifier(id: IdEitherWithInstance): Identifier {
  if ('id' in id) return { kind: 'id', id: id.id };
  if ('externalId' in id) return { kind: 'ext', externalId: id.externalId };
  return {
    kind: 'inst',
    space: id.instanceId.space,
    externalId: id.instanceId.externalId,
  };
}

function itemIdentifier(item: DatapointsInsertWithUnitItem): Identifier {
  if ('id' in item) return { kind: 'id', id: item.id };
  if ('externalId' in item) return { kind: 'ext', externalId: item.externalId };
  return {
    kind: 'inst',
    space: item.instanceId.space,
    externalId: item.instanceId.externalId,
  };
}

function* timeSeriesIdentifiers(ts: TimeSeries): Iterable<Identifier> {
  if (ts.id != null) yield { kind: 'id', id: ts.id };
  if (ts.externalId != null && ts.externalId !== '') {
    yield { kind: 'ext', externalId: ts.externalId };
  }
  if (ts.instanceId != null) {
    yield {
      kind: 'inst',
      space: ts.instanceId.space,
      externalId: ts.instanceId.externalId,
    };
  }
}

function dedupeRetrieveIds(
  ids: IdEitherWithInstance[]
): IdEitherWithInstance[] {
  const seen = new Map<string, IdEitherWithInstance>();
  for (const id of ids) {
    const key = identifierKey(toIdentifier(id));
    if (!seen.has(key)) seen.set(key, id);
  }
  return [...seen.values()];
}

function fail(message: string): never {
  throw new CogniteError(message, 400);
}

function convertBetweenUnitConversions(
  value: number,
  src: UnitConversion,
  dst: UnitConversion
): number {
  const base = (value + src.offset) * src.multiplier;
  return base / dst.multiplier - dst.offset;
}

function convertDatapoint(
  dp: DatapointWrite,
  sameUnit: boolean,
  src: UnitConversion,
  dst: UnitConversion
): DatapointWrite {
  if (typeof dp.value === 'string' || sameUnit) return dp;
  return { ...dp, value: convertBetweenUnitConversions(dp.value, src, dst) };
}

/** Beta extension of {@link DataPointsAPI} with unit-aware insert. */
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
   * Insert datapoints, converting numeric values from `unit.externalId` to each time
   * series' stored `unitExternalId` before posting. Only numeric time series are supported.
   */
  public insertWithUnitConversion = async (
    items: DatapointsInsertWithUnitItem[]
  ): Promise<object> => {
    if (items.length === 0) {
      return {};
    }
    const converted = await this.convertInsertItemsWithUnit(items);
    return this.insert(converted);
  };

  private async convertInsertItemsWithUnit(
    items: DatapointsInsertWithUnitItem[]
  ): Promise<DatapointsInsertItem[]> {
    const unitByTsKey = await this.resolveTargetUnits(items);
    const unitByExternalId = await this.loadUnitCatalog(items, unitByTsKey);
    return items.map((item) =>
      this.convertItem(item, unitByTsKey, unitByExternalId)
    );
  }

  private async resolveTargetUnits(
    items: DatapointsInsertWithUnitItem[]
  ): Promise<Map<string, CogniteExternalId>> {
    const retrieveIds = dedupeRetrieveIds(
      items.map((item) => identifierToRetrieveId(itemIdentifier(item)))
    );
    const timeSeriesList = await this.timeSeriesApi.retrieve(retrieveIds, {
      ignoreUnknownIds: false,
    });

    const unitByTsKey = new Map<string, CogniteExternalId>();
    for (const ts of timeSeriesList) {
      if (ts.type !== 'numeric') {
        fail(
          `insertWithUnitConversion only supports numeric time series (type=${ts.type ?? 'unknown'}). Time series id=${ts.id}, externalId=${ts.externalId ?? 'n/a'}`
        );
      }
      const unitExternalId = ts.unitExternalId;
      if (unitExternalId == null || unitExternalId === '') {
        fail(
          `Time series is missing unitExternalId (required for insertWithUnitConversion). Time series id=${ts.id}, externalId=${ts.externalId ?? 'n/a'}`
        );
      }
      for (const id of timeSeriesIdentifiers(ts)) {
        unitByTsKey.set(identifierKey(id), unitExternalId);
      }
    }
    return unitByTsKey;
  }

  private async loadUnitCatalog(
    items: DatapointsInsertWithUnitItem[],
    unitByTsKey: Map<string, CogniteExternalId>
  ): Promise<Map<string, Unit>> {
    const unitExternalIdsToLoad = new Set<string>();
    for (const item of items) {
      const key = identifierKey(itemIdentifier(item));
      const targetUnit = unitByTsKey.get(key);
      if (targetUnit == null) {
        fail(
          `Time series not found in retrieve response for insert item (key=${key})`
        );
      }
      unitExternalIdsToLoad.add(item.unit.externalId);
      unitExternalIdsToLoad.add(targetUnit);
    }

    const unitsList = await this.unitsApi.retrieve(
      [...unitExternalIdsToLoad].map((externalId) => ({ externalId }))
    );
    const unitByExternalId = new Map<string, Unit>();
    for (const u of unitsList) {
      unitByExternalId.set(u.externalId, u);
    }
    return unitByExternalId;
  }

  private convertItem(
    item: DatapointsInsertWithUnitItem,
    unitByTsKey: Map<string, CogniteExternalId>,
    unitByExternalId: Map<string, Unit>
  ): DatapointsInsertItem {
    const key = identifierKey(itemIdentifier(item));
    const targetUnitExternalId = unitByTsKey.get(key) as CogniteExternalId;
    const sourceUnitExternalId = item.unit.externalId;
    const sameUnit = sourceUnitExternalId === targetUnitExternalId;
    const srcUnit = unitByExternalId.get(sourceUnitExternalId) as Unit;
    const dstUnit = unitByExternalId.get(targetUnitExternalId) as Unit;

    if (srcUnit.quantity !== dstUnit.quantity) {
      fail(
        `Incompatible units for conversion: unit.externalId=${sourceUnitExternalId} (quantity=${srcUnit.quantity}) vs time series unit=${targetUnitExternalId} (quantity=${dstUnit.quantity})`
      );
    }

    const convertedDatapoints = item.datapoints.map((dp) =>
      convertDatapoint(dp, sameUnit, srcUnit.conversion, dstUnit.conversion)
    );

    const { unit: _ignored, ...rest } = item;
    return {
      ...rest,
      datapoints: convertedDatapoints,
    } as DatapointsInsertItem;
  }
}
