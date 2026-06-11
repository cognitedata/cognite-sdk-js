// Copyright 2026 Cognite AS

import type {
  CogniteExternalId,
  CogniteInstanceId,
  Cursor,
  ExternalId,
  InstanceId,
  InternalId,
  Limit,
} from '@cognite/sdk-core';
import type {
  DatapointInfo,
  IgnoreUnknownIds,
  Timestamp,
} from '../../types/common';

// =====================================================
// Aggregate name types
// =====================================================

/**
 * Aggregate functions available for numeric time series
 */
export type NumericAggregateName =
  | 'average'
  | 'max'
  | 'min'
  | 'count'
  | 'sum'
  | 'interpolation'
  | 'stepInterpolation'
  | 'totalVariation'
  | 'continuousVariance'
  | 'discreteVariance'
  | 'maxDatapoint'
  | 'minDatapoint'
  | 'countGood'
  | 'countUncertain'
  | 'countBad'
  | 'durationGood'
  | 'durationUncertain'
  | 'durationBad';

/**
 * Aggregate functions available for state time series
 */
export type StateAggregateName =
  | 'stateCount'
  | 'stateDuration'
  | 'stateTransitions';

/** All aggregate functions accepted by data point queries */
export type AggregateName = NumericAggregateName | StateAggregateName;

// =====================================================
// Data point status types
// =====================================================

/**
 * Status code for a data point, following OPC UA conventions.
 * Either `code` or `symbol` is required; if both are set they must be consistent.
 * @see https://docs.cognite.com/dev/concepts/reference/status_codes
 */
export interface DatapointStatus {
  /** Numeric status code (e.g. 0 for Good, 2147483648 for Bad) */
  code: number;
  /** Status symbol name (e.g. 'Good', 'Uncertain', 'Bad') */
  symbol: string;
}

// =====================================================
// Data point value types
// =====================================================

/**
 * The timestamp and value of a min/max data point aggregate.
 */
export interface DatapointExtremum {
  timestamp: Date;
  value: number;
  status?: DatapointStatus;
}

/**
 * Aggregate fields common to all aggregate responses
 * (data point counts and status-code durations).
 */
export interface CommonDatapointAggregate {
  /** Number of data points in the aggregate period. */
  count?: number;
  countGood?: number;
  countUncertain?: number;
  countBad?: number;
  /** Duration in milliseconds with Good status */
  durationGood?: number;
  /** Duration in milliseconds with Uncertain status */
  durationUncertain?: number;
  /** Duration in milliseconds with Bad status */
  durationBad?: number;
}

export interface NumericDatapointAggregate
  extends DatapointInfo,
    CommonDatapointAggregate {
  average?: number;
  max?: number;
  min?: number;
  sum?: number;
  interpolation?: number;
  stepInterpolation?: number;
  continuousVariance?: number;
  discreteVariance?: number;
  totalVariation?: number;
  maxDatapoint?: DatapointExtremum;
  minDatapoint?: DatapointExtremum;
}

export interface NumericDatapoint extends DatapointInfo {
  value: number;
  status?: DatapointStatus;
}

export interface StringDatapoint extends DatapointInfo {
  value: string;
  status?: DatapointStatus;
}

export interface DatapointWrite {
  timestamp: Timestamp;
  value: number | string;
  status?: DatapointStatus;
}

// =====================================================
// Data points delete types
// =====================================================

export interface DatapointsDeleteRange {
  /**
   * The timestamp of first datapoint to delete
   */
  inclusiveBegin: Timestamp;
  /**
   * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
   */
  exclusiveEnd?: Timestamp;
}

export type DatapointsDeleteRequest =
  | (InternalId & DatapointsDeleteRange)
  | (ExternalId & DatapointsDeleteRange)
  | (InstanceId & DatapointsDeleteRange);

// =====================================================
// Data points response types
// =====================================================

export interface NextCursor {
  nextCursor?: string;
}

export interface DatapointsMetadata extends InternalId {
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: CogniteExternalId;

  /**
   * Instance id of the timeseries the datapoints belong to in Cognite Data Modeling.
   */
  instanceId?: CogniteInstanceId;

  /**
   * Whether or not the datapoints are string values.
   */
  isString: boolean;
  /**
   * Name of the physical unit of the time series
   */
  unit?: string;
}

export interface NumericDatapointAggregates
  extends DatapointsMetadata,
    NextCursor {
  isString: false;
  // TODO(next-major): Make required per API spec (DatapointsGetAggregateDatapoint)
  type?: 'numeric';
  /**
   * Whether the timeseries is a step series or not
   */
  isStep: boolean;
  datapoints: NumericDatapointAggregate[];
  /**
   * The physical unit of the time series (reference to unit catalog). Replaced with target unit if data points were converted.
   */
  unitExternalId?: CogniteExternalId;
}

export type Datapoints = NumericDatapoints | StringDatapoints | StateDatapoints;

export interface NumericDatapoints extends DatapointsMetadata, NextCursor {
  isString: false;
  // TODO(next-major): Make required per API spec (DatapointsGetDoubleDatapoint)
  type?: 'numeric';
  /**
   * Whether the timeseries is a step series or not
   */
  isStep?: boolean;
  /**
   * The list of datapoints
   */
  datapoints: NumericDatapoint[];
  /**
   * The physical unit of the time series (reference to unit catalog). Replaced with target unit if data points were converted.
   */
  unitExternalId?: CogniteExternalId;
}

export interface StringDatapoints extends DatapointsMetadata, NextCursor {
  isString: true;
  // TODO(next-major): Make required per API spec (DatapointsGetStringDatapoint)
  type?: 'string';
  /**
   * The list of datapoints
   */
  datapoints: StringDatapoint[];
}

// =====================================================
// Data points insert types
// =====================================================

export interface DatapointsInsertProperties {
  datapoints: DatapointWrite[];
}

export interface DatapointsInsertByExternalId
  extends DatapointsInsertProperties,
    ExternalId {}

export interface DatapointsInsertByInstanceId
  extends DatapointsInsertProperties,
    InstanceId {}

export interface DatapointsInsertById
  extends DatapointsInsertProperties,
    InternalId {}

export type DatapointsInsertItem =
  | DatapointsInsertById
  | DatapointsInsertByExternalId
  | DatapointsInsertByInstanceId;

// =====================================================
// Data points query types
// =====================================================

export interface DatapointsMultiQuery extends DatapointsMultiQueryBase {
  items: DatapointsQuery[];
}

export interface DatapointsMultiQueryBase extends Limit, IgnoreUnknownIds {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in a Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: AggregateName[];
  /**
   * The time granularity size and unit to aggregate over.
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
  /**
    * Defaul "UTC" For aggregates of granularity 'hour' and longer, which time zone should we align to. Align to the start of the hour, start of the day or start of the month. For time zones of type Region/Location, the aggregate duration can vary, typically due to daylight saving time. For time zones of type UTC+/-HH:MM, use increments of 15 minutes.
Note: Time zones with minute offsets (e.g. UTC+05:30 or Asia/Kolkata) may take longer to execute. Historical time zones, with offsets not multiples of 15 minutes, are not supported.
   */
  timeZone?: string;
}

export type DatapointsQuery =
  | DatapointsQueryId
  | DatapointsQueryExternalId
  | DatapointsQueryInstanceId;

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export interface DatapointsQueryInstanceId
  extends DatapointsQueryProperties,
    InstanceId {}

export interface DatapointsQueryProperties extends Limit, Cursor {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: AggregateName[];
  /**
   * The granularity size and granularity of the aggregates (2h)
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
  /**
   * The unit externalId of the data points returned.
   * If the time series does not have a unitExternalId that
   * can be converted to the targetUnit,
   * an error will be returned. Cannot be used with targetUnitSystem.
   */
  targetUnit?: CogniteExternalId;
  /**
   * The unit system of the data points returned. Cannot be used with targetUnit.
   */
  targetUnitSystem?: CogniteExternalId;
  /**
   * Default: "UTC" Which time zone to align aggregates to. Omit to use top-level value.
   */
  timeZone?: string;
  /**
   * Include status codes in the response. Good (code 0) status codes are always omitted.
   * @default false
   */
  includeStatus?: boolean;
  /**
   * Treat data points with Bad status codes as if they do not exist.
   * Set to false to include bad data points.
   * @default true
   */
  ignoreBadDataPoints?: boolean;
  /**
   * Treat data points with Uncertain status codes as Bad.
   * @default true
   */
  treatUncertainAsBad?: boolean;
}

// =====================================================
// Latest data point types
// =====================================================

export type LatestDataBeforeRequest =
  | (InternalId & LatestDataPropertyFilter)
  | (ExternalId & LatestDataPropertyFilter)
  | (InstanceId & LatestDataPropertyFilter);

export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time as a Date object or number of milliseconds since epoch.
   */
  before?: string | Date | number;
  /**
   * The unit externalId of the data points returned. If the time series does not have a
   * unitExternalId that can be converted to the targetUnit, an error will be returned.
   * Cannot be used with targetUnitSystem.
   */
  targetUnit?: string;
  /**
   * The unit system of the data points returned. Cannot be used with targetUnit.
   */
  targetUnitSystem?: string;
  /**
   * Include status codes in the response. Good (code 0) status codes are always omitted.
   * @default false
   */
  includeStatus?: boolean;
  /**
   * Treat data points with Bad status codes as if they do not exist.
   * Set to false to include bad data points.
   * @default true
   */
  ignoreBadDataPoints?: boolean;
  /**
   * Treat data points with Uncertain status codes as Bad.
   * @default true
   */
  treatUncertainAsBad?: boolean;
}

// =====================================================
// State data point types
// =====================================================

/**
 * A state data point to insert. At least one of `value`, `numericValue` or
 * `stringValue` must be provided unless the status is bad.
 */
export interface StateDatapointWrite {
  timestamp: Timestamp;
  /**
   * Alias for `numericValue`: the SDK sends it to the API as `numericValue`
   * (ignored if `numericValue` is also set).
   * @deprecated Use numericValue instead. Will be removed in next major release.
   */
  value?: number;
  numericValue?: number;
  stringValue?: string;
  status?: DatapointStatus;
}

export interface StateDatapointsInsertProperties {
  datapoints: StateDatapointWrite[];
}

export type StateDatapointsInsertItem =
  | (InternalId & StateDatapointsInsertProperties)
  | (ExternalId & StateDatapointsInsertProperties)
  | (InstanceId & StateDatapointsInsertProperties);

export interface StateDatapoint extends DatapointInfo {
  /**
   * Numeric representation of the state, mirrored by the SDK from
   * `numericValue`. May be missing if status is bad.
   * @deprecated Use numericValue instead. Will be removed in next major release.
   */
  value?: number;
  /** Numeric representation of the state. May be missing if status is bad. */
  numericValue?: number;
  /** String representation of the state. May be missing if the state no longer exists in the state set or if status is bad. */
  stringValue?: string;
  status?: DatapointStatus;
}

export interface StateDatapoints extends DatapointsMetadata, NextCursor {
  isString: false;
  type: 'state';
  isStep?: boolean;
  datapoints: StateDatapoint[];
}

export interface StateAggregateValue {
  numericValue: number;
  /** String representation of the state. May be omitted if the state no longer exists in the state set. */
  stringValue?: string;
  /** Number of data points in the aggregate period with this state value. */
  stateCount?: number;
  /**
   * Number of times the state changed to this value in the aggregate period,
   * counting the very first data point and transitions from bad data points.
   */
  stateTransitions?: number;
  /**
   * Duration in milliseconds the time series was in this state. Carries over
   * from the previous aggregate period, so it may be non-zero even if the
   * state does not occur in the current period.
   */
  stateDuration?: number;
}

export interface StateDatapointAggregate
  extends DatapointInfo,
    CommonDatapointAggregate {
  stateAggregates?: StateAggregateValue[];
}

export interface StateDatapointAggregates
  extends DatapointsMetadata,
    NextCursor {
  isString: false;
  type: 'state';
  isStep: boolean;
  datapoints: StateDatapointAggregate[];
  unitExternalId?: CogniteExternalId;
}

// =====================================================
// Deprecated exports
// =====================================================

/** @deprecated Use IgnoreUnknownIds directly. Will be removed in next major release. */
export type LatestDataParams = IgnoreUnknownIds;

/** @deprecated Use NumericDatapointAggregate instead. Will be removed in next major release. */
export type DatapointAggregate = NumericDatapointAggregate;

/** @deprecated Use NumericAggregateName instead. Will be removed in next major release. */
export type Aggregate = NumericAggregateName;

/** @deprecated Use NumericDatapoint instead. Will be removed in next major release. */
export type DoubleDatapoint = NumericDatapoint;

/** @deprecated Use DatapointWrite instead. Will be removed in next major release. */
export type ExternalDatapoint = DatapointWrite;

/** @deprecated Use NumericDatapointAggregates instead. Will be removed in next major release. */
export type DatapointAggregates = NumericDatapointAggregates;

/** @deprecated Use NumericDatapoints instead. Will be removed in next major release. */
export type DoubleDatapoints = NumericDatapoints;

/** @deprecated Use DatapointsInsertProperties instead. Will be removed in next major release. */
export type ExternalDatapoints = DatapointsInsertProperties;

/** @deprecated Use DatapointsInsertByExternalId instead. Will be removed in next major release. */
export type ExternalDatapointExternalId = DatapointsInsertByExternalId;

/** @deprecated Use DatapointsInsertByInstanceId instead. Will be removed in next major release. */
export type ExternalDatapointInstanceId = DatapointsInsertByInstanceId;

/** @deprecated Use DatapointsInsertById instead. Will be removed in next major release. */
export type ExternalDatapointId = DatapointsInsertById;

/** @deprecated Use DatapointsInsertItem instead. Will be removed in next major release. */
export type ExternalDatapointsQuery = DatapointsInsertItem;

/**
 * @deprecated Use DatapointsMultiQuery with `granularity: '1mo'` instead. Will be removed in next major release.
 */
export interface DatapointsMonthlyGranularityMultiQuery
  extends Omit<DatapointsMultiQueryBase, 'granularity'> {
  items: DatapointsQuery[];
}
