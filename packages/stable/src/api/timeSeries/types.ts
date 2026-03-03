// Copyright 2025 Cognite AS

import type {
  CogniteExternalId,
  CogniteInstanceId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  IdEither,
  InstanceId,
  InternalId,
  Limit,
} from '@cognite/sdk-core';
import type {
  AggregateResponse,
  ArrayPatchLong,
  CreatedAndLastUpdatedTime,
  CreatedAndLastUpdatedTimeFilter,
  DatapointInfo,
  ExternalIdPrefix,
  Metadata,
  MetadataPatch,
  NullableSinglePatchLong,
  NullableSinglePatchString,
  Partition,
  Timestamp,
} from '../../types/common';

// =====================================================
// Deprecated primitive type aliases
// =====================================================

/** @deprecated Use `boolean` directly. Will be removed in next major release. */
export type TimeseriesIsStep = boolean;

/** @deprecated Use `boolean` directly. Will be removed in next major release. */
export type TimeseriesIsString = boolean;

/** @deprecated Use `string` directly. Will be removed in next major release. */
export type TimeseriesName = string;

/** @deprecated Use `string` directly. Will be removed in next major release. */
export type TimeseriesUnit = string;

// =====================================================
// Time Series identifier type
// =====================================================

export type TimeSeriesIdEither = InternalId | ExternalId;

/** @deprecated Use TimeSeriesIdEither instead. Will be removed in next major release. */
export type TimeseriesIdEither = TimeSeriesIdEither;

// =====================================================
// Time Series main types
// =====================================================

export type TimeSeriesType = 'numeric' | 'string' | 'state';

/** @deprecated Use TimeSeriesType instead. Will be removed in next major release. */
export type TimeseriesType = TimeSeriesType;

export interface TimeSeries extends InternalId, CreatedAndLastUpdatedTime {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  /**
   * The ID of an instance in Cognite Data Models.
   */
  instanceId?: CogniteInstanceId;
  name?: string;
  isString: boolean;
  // TODO(next-major): Make required per API spec (GetTimeSeriesMetadataDTO)
  type?: TimeSeriesType;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  dataSetId?: CogniteInternalId;
  isStep: boolean;
  // TODO(next-major): Make optional per API spec (not in required array)
  description: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
  /**
   * The physical unit of the time series (reference to unit catalog).
   */
  unitExternalId?: CogniteExternalId;
}

/** @deprecated Use TimeSeries instead. Will be removed in next major release. */
export type Timeseries = TimeSeries;

export interface TimeSeriesCreate {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: CogniteExternalId;
  /**
   * @deprecated This field is deprecated and ignored by the API.
   */
  legacyName?: string;
  /**
   * Human readable name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString?: boolean;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  /**
   * DataSet that this time series related with.
   */
  dataSetId?: CogniteInternalId;
  /**
   * Whether the time series is a step series or not.
   */
  isStep?: boolean;
  /**
   * Description of the time series.
   */
  description?: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
  /**
   * The physical unit of the time series (reference to unit catalog).
   */
  unitExternalId?: CogniteExternalId;
}

/** @deprecated Use TimeSeriesCreate instead. Will be removed in next major release. */
export type ExternalTimeseries = TimeSeriesCreate;

// =====================================================
// Time Series filter types
// =====================================================

export interface TimeSeriesFilter extends CreatedAndLastUpdatedTimeFilter {
  name?: string;
  unit?: string;
  isString?: boolean;
  isStep?: boolean;
  metadata?: Metadata;
  /**
   * Get time series related to these assets. Takes [ 1 .. 100 ] unique items.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Asset External IDs of related equipment that this time series relates to.
   */
  assetExternalIds?: CogniteExternalId[];
  /**
   * Only include timeseries that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: CogniteInternalId[];
  /**
   * Only include assets that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  /**
   * Only include timeseries that are related to an asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  externalIdPrefix?: ExternalIdPrefix;
  /**
   * The physical unit of the time series (reference to unit catalog).
   */
  unitExternalId?: CogniteExternalId;
  /**
   * Filter on the physical quantity of the unit (e.g., 'temperature', 'pressure').
   */
  unitQuantity?: string;
}

/** @deprecated Use TimeSeriesFilter instead. Will be removed in next major release. */
export type TimeseriesFilter = TimeSeriesFilter;

export interface TimeSeriesFilterQuery extends FilterQuery {
  filter?: TimeSeriesFilter;
  partition?: Partition;
}

/** @deprecated Use TimeSeriesFilterQuery instead. Will be removed in next major release. */
export type TimeseriesFilterQuery = TimeSeriesFilterQuery;

// =====================================================
// Time Series search types
// =====================================================

export interface TimeSeriesSearch {
  /**
   * Prefix and fuzzy search on name.
   */
  name?: string;
  /**
   * Prefix and fuzzy search on description.
   */
  description?: string;
  /**
   * Search on name and description using wildcard search on each of the words (separated by spaces). Retrieves results where at least one word must match. Example: '*some* *other*'
   */
  query?: string;
}

/** @deprecated Use TimeSeriesSearch instead. Will be removed in next major release. */
export type TimeseriesSearch = TimeSeriesSearch;

export interface TimeSeriesSearchFilter extends Limit {
  filter?: TimeSeriesFilter;
  search?: TimeSeriesSearch;
}

/** @deprecated Use TimeSeriesSearchFilter instead. Will be removed in next major release. */
export type TimeseriesSearchFilter = TimeSeriesSearchFilter;

// =====================================================
// Time Series update types
// =====================================================

export type TimeSeriesUpdateCommonProperties = {
  externalId?: NullableSinglePatchString;
  metadata?: MetadataPatch;
  assetId?: NullableSinglePatchLong;
  dataSetId?: NullableSinglePatchLong;
};

/** @deprecated Use TimeSeriesUpdateCommonProperties instead. Will be removed in next major release. */
export type TimeseriesUpdateCommonProperies = TimeSeriesUpdateCommonProperties;

export type TimeSeriesUpdateAssetCentricProperties =
  TimeSeriesUpdateCommonProperties & {
    name?: NullableSinglePatchString;
    unit?: NullableSinglePatchString;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
    unitExternalId?: NullableSinglePatchString;
  };

/** @deprecated Use TimeSeriesUpdateAssetCentricProperties instead. Will be removed in next major release. */
export type TimeseriesUpdateAssetCentricProperies =
  TimeSeriesUpdateAssetCentricProperties;

export interface TimeSeriesPatch {
  update: TimeSeriesUpdateAssetCentricProperties;
}

export interface TimeSeriesPatchByInstanceId {
  update: TimeSeriesUpdateCommonProperties;
}

export interface TimeSeriesUpdateByExternalId
  extends TimeSeriesPatch,
    ExternalId {}

export interface TimeSeriesUpdateById extends TimeSeriesPatch, InternalId {}

export interface TimeSeriesUpdateByInstanceId
  extends TimeSeriesPatchByInstanceId,
    InstanceId {}

export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId
  | TimeSeriesUpdateByInstanceId;

// =====================================================
// Time Series aggregate types
// =====================================================

export type TimeSeriesAggregate = AggregateResponse;

/** @deprecated Use TimeSeriesAggregate instead. Will be removed in next major release. */
export type TimeseriesAggregate = TimeSeriesAggregate;

export interface TimeSeriesAggregateQuery {
  /**
   * Filter on timeseries with strict matching.
   */
  filter?: TimeSeriesFilter;
}

/** @deprecated Use TimeSeriesAggregateQuery instead. Will be removed in next major release. */
export type TimeseriesAggregateQuery = TimeSeriesAggregateQuery;

// =====================================================
// Synthetic Time Series types
// =====================================================

export interface SyntheticQuery extends Limit {
  expression: string;
  start?: string | Timestamp;
  end?: string | Timestamp;
  /**
   * For aggregates of granularity 'hour' and longer, which time zone to align to.
   * @default "UTC"
   * @example "Europe/Oslo"
   */
  timeZone?: string;
}

export interface SyntheticDataValue extends DatapointInfo {
  value: number;
}

export interface SyntheticDataError extends DatapointInfo {
  error: string;
}

export type SyntheticDatapoint = SyntheticDataValue | SyntheticDataError;

export interface SyntheticQueryResponse {
  isString?: boolean;
  datapoints: SyntheticDatapoint[];
}
