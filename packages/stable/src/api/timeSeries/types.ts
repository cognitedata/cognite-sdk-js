// Copyright 2025 Cognite AS

import type {
  CogniteExternalId,
  CogniteInternalId,
  ExternalId,
  FilterQuery,
  IdEither,
  InstanceId,
  InternalId,
  Limit,
} from '@cognite/sdk-core';

/** Timestamp - either a number (ms since epoch) or a Date object */
type Timestamp = number | Date;

/** Metadata - key-value string pairs */
type Metadata = { [key: string]: string };

/** External ID prefix for filtering */
type ExternalIdPrefix = string;

/** Partition string for parallel listing */
type Partition = string;

/** Instance ID in Cognite Data Models */
interface CogniteInstanceId {
  space: string;
  externalId: string;
}

/** Created and last updated timestamps */
interface CreatedAndLastUpdatedTime {
  createdTime: Date;
  lastUpdatedTime: Date;
}

/** Filter for created/updated time ranges */
interface CreatedAndLastUpdatedTimeFilter {
  createdTime?: { min?: Timestamp; max?: Timestamp };
  lastUpdatedTime?: { min?: Timestamp; max?: Timestamp };
}

/** Datapoint timestamp info */
interface DatapointInfo {
  timestamp: Date;
}

/** Aggregate response with count */
interface AggregateResponse {
  count: number;
}

/** Nullable patch for string fields */
type NullableSinglePatchString = { set: string } | { setNull: true };

/** Nullable patch for number fields */
type NullableSinglePatchLong = { set: number } | { setNull: true };

/** Metadata patch operations */
type MetadataPatch = { set: Metadata } | { add?: Metadata; remove?: string[] };

/** Array patch for number arrays */
type ArrayPatchLong = { set: number[] } | { add?: number[]; remove?: number[] };

// =====================================================
// Time Series type aliases
// =====================================================

/**
 * Whether the time series is a step series or not.
 */
export type TimeseriesIsStep = boolean;

/**
 * Whether the time series is string valued or not.
 */
export type TimeseriesIsString = boolean;

/**
 * Name of time series
 */
export type TimeseriesName = string;

/**
 * The physical unit of the time series.
 */
export type TimeseriesUnit = string;

/**
 * Time series identifier - either internal ID or external ID
 */
export type TimeseriesIdEither = InternalId | ExternalId;

// =====================================================
// Time Series main types
// =====================================================

/**
 * A time series in Cognite Data Fusion
 */
export interface Timeseries extends InternalId, CreatedAndLastUpdatedTime {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  /**
   * The ID of an instance in Cognite Data Models.
   */
  instanceId?: CogniteInstanceId;
  name?: TimeseriesName;
  isString: TimeseriesIsString;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  unit?: TimeseriesUnit;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  dataSetId?: CogniteInternalId;
  isStep: TimeseriesIsStep;
  /**
   * Description of the time series.
   */
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

/**
 * Input type for creating a time series
 */
export interface ExternalTimeseries {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: CogniteExternalId;
  /**
   * Set a value for legacyName to allow applications using API v0.3, v04, v05, and v0.6 to access this time series. The legacy name is the human-readable name for the time series and is mapped to the name field used in API versions 0.3-0.6. The legacyName field value must be unique, and setting this value to an already existing value will return an error. We recommend that you set this field to the same value as externalId.
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
   * Security categories required in order to access this time series."
   */
  securityCategories?: number[];
  /**
   * The physical unit of the time series (reference to unit catalog).
   */
  unitExternalId?: CogniteExternalId;
}

// =====================================================
// Time Series filter types
// =====================================================

/**
 * Filter for listing time series
 */
export interface TimeseriesFilter extends CreatedAndLastUpdatedTimeFilter {
  name?: TimeseriesName;
  unit?: TimeseriesUnit;
  isString?: TimeseriesIsString;
  isStep?: TimeseriesIsStep;
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
}

/**
 * Query parameters for listing time series
 */
export interface TimeseriesFilterQuery extends FilterQuery {
  filter?: TimeseriesFilter;
  partition?: Partition;
}

// =====================================================
// Time Series search types
// =====================================================

/**
 * Search parameters for time series
 */
export interface TimeseriesSearch {
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

/**
 * Filter for searching time series
 */
export interface TimeseriesSearchFilter extends Limit {
  filter?: TimeseriesFilter;
  search?: TimeseriesSearch;
}

// =====================================================
// Time Series update types
// =====================================================

/**
 * Common update properties for time series (used for all update types)
 */
export type TimeseriesUpdateCommonProperies = {
  externalId?: NullableSinglePatchString;
  metadata?: MetadataPatch;
  assetId?: NullableSinglePatchLong;
  dataSetId?: NullableSinglePatchLong;
};

/**
 * Update properties for asset-centric time series
 */
export type TimeseriesUpdateAssetCentricProperies =
  TimeseriesUpdateCommonProperies & {
    name?: NullableSinglePatchString;
    unit?: NullableSinglePatchString;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
    unitExternalId?: NullableSinglePatchString;
  };

/**
 * Time series patch for standard updates
 */
export interface TimeSeriesPatch {
  update: TimeseriesUpdateAssetCentricProperies;
}

/**
 * Time series patch for updates by instance ID
 */
export interface TimeSeriesPatchByInstanceId {
  update: TimeseriesUpdateCommonProperies;
}

/**
 * Update time series by external ID
 */
export interface TimeSeriesUpdateByExternalId
  extends TimeSeriesPatch,
    ExternalId {}

/**
 * Update time series by internal ID
 */
export interface TimeSeriesUpdateById extends TimeSeriesPatch, InternalId {}

/**
 * Update time series by instance ID
 */
export interface TimeSeriesUpdateByInstanceId
  extends TimeSeriesPatchByInstanceId,
    InstanceId {}

/**
 * Union type for all time series update variants
 */
export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId
  | TimeSeriesUpdateByInstanceId;

// =====================================================
// Time Series aggregate types
// =====================================================

/**
 * Response from timeseries aggregate endpoint
 */
export type TimeseriesAggregate = AggregateResponse;

/**
 * Query schema for timeseries aggregate endpoint
 */
export interface TimeseriesAggregateQuery {
  /**
   * Filter on timeseries with strict matching.
   */
  filter?: TimeseriesFilter;
}

// =====================================================
// Synthetic Time Series types
// =====================================================

/**
 * A query for a synthetic time series
 */
export interface SyntheticQuery extends Limit {
  expression: string;
  start?: string | Timestamp;
  end?: string | Timestamp;
}

/**
 * A single synthetic data point value
 */
export interface SyntheticDataValue extends DatapointInfo {
  value: number;
}

/**
 * A synthetic data point error
 */
export interface SyntheticDataError extends DatapointInfo {
  error: string;
}

/**
 * A synthetic data point - either a value or an error
 */
export type SyntheticDatapoint = SyntheticDataValue | SyntheticDataError;

/**
 * Response of a synthetic time series query
 */
export interface SyntheticQueryResponse {
  isString?: TimeseriesIsString;
  datapoints: SyntheticDatapoint[];
}
