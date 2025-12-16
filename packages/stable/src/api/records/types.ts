// Copyright 2025 Cognite AS

/**
 * @pattern ^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$
 */
export type RecordSpaceId = string;

/**
 * @pattern ^[^\\x00]{1,256}$
 */
export type RecordExternalId = string;

/**
 * A value matching the data type of the defined property
 * */
export type RawPropertyValueV3 =
  | string
  | number
  | boolean
  | object
  | string[]
  | boolean[]
  | number[]
  | object[];

/**
 * Group of property values indexed by a local unique identifier. The identifier has to have a length of between 1 and 255 characters.  It must also match the pattern ```^[a-zA-Z0-9][a-zA-Z0-9_-]{0,253}[a-zA-Z0-9]?$``` , and it cannot be any of the following reserved identifiers: ```space```, ```externalId```, ```createdTime```, ```lastUpdatedTime```, ```deletedTime```, and ```extensions```. The maximum number of properties depends on your subscription, and is by default 100.
 * @example {"someStringProperty":"someStringValue","someDirectRelation":{"space":"mySpace","externalId":"someNode"},"someIntArrayProperty":[1,2,3,4]}
 */
export type PropertyValueGroupV3 = Record<string, RawPropertyValueV3>;

/**
 * Reference to an existing container
 */
export interface ContainerReference {
  /** External-id of the container */
  externalId: RecordExternalId;
  /** Id of the space hosting (containing) the container */
  space: RecordSpaceId;
  type: 'container';
}

/**
 * Sort direction for record queries
 */
export type RecordSortDirection = 'ascending' | 'descending';

/**
 * Timestamp bound for time range filters (ISO 8601 string or Unix ms since epoch)
 */
export type LastUpdatedTimeRangeBound = string | number;

/**
 * Property values for a container source
 */
export interface RecordData {
  /**
   * Reference to the container
   */
  source: ContainerReference;
  /**
   * Property values for the container
   */
  properties: PropertyValueGroupV3;
}

/**
 * Record to write/ingest into a stream
 */
export interface RecordWrite {
  /**
   * The space that the record belongs to
   */
  space: RecordSpaceId;
  /**
   * External ID of the record
   */
  externalId: RecordExternalId;
  /**
   * List of source properties to write
   */
  sources: RecordData[];
}

/**
 * Source selector for specifying which container properties to return
 */
export interface SourceSelector {
  /**
   * Reference to the container
   */
  source: ContainerReference;
  /**
   * Properties to return for the specified container
   */
  properties: string[];
}

/**
 * Last updated time filter for records
 */
export interface LastUpdatedTimeFilter {
  /**
   * Greater than or equal to
   */
  gte?: LastUpdatedTimeRangeBound;
  /**
   * Greater than
   */
  gt?: LastUpdatedTimeRangeBound;
  /**
   * Less than or equal to
   */
  lte?: LastUpdatedTimeRangeBound;
  /**
   * Less than
   */
  lt?: LastUpdatedTimeRangeBound;
}

/**
 * Sort specification for a property
 */
export interface RecordSort {
  /**
   * Property to sort by
   */
  property: string[];
  /**
   * Sort direction
   */
  direction?: RecordSortDirection;
}

/**
 * Property reference for filters. Either a top-level property (1 element) or
 * a container property [space, container, property] (3 elements).
 */
export type FilterProperty = [string] | [string, string, string];

/**
 * Range value for range filters
 */
export type RangeValue = string | number | boolean;

/**
 * Boolean filter combining other filters with and/or/not
 */
export type BoolFilter =
  | { and: RecordFilter[] }
  | { or: RecordFilter[] }
  | { not: RecordFilter };

/**
 * Leaf filter for matching records
 */
export type LeafFilter =
  | { matchAll: Record<string, never> }
  | { exists: { property: FilterProperty } }
  | { equals: { property: FilterProperty; value: RawPropertyValueV3 } }
  | { hasData: ContainerReference[] }
  | { prefix: { property: FilterProperty; value: string } }
  | {
      range: {
        property: FilterProperty;
        gte?: RangeValue;
        gt?: RangeValue;
        lte?: RangeValue;
        lt?: RangeValue;
      };
    }
  | { in: { property: FilterProperty; values: RawPropertyValueV3[] } }
  | { containsAll: { property: FilterProperty; values: RawPropertyValueV3[] } }
  | { containsAny: { property: FilterProperty; values: RawPropertyValueV3[] } };

/**
 * Filter DSL for querying records
 */
export type RecordFilter = BoolFilter | LeafFilter;

/**
 * Filter request for retrieving records from a stream
 */
export interface RecordFilterRequest {
  /**
   * Filter on last updated time. Required for immutable streams.
   */
  lastUpdatedTime?: LastUpdatedTimeFilter;
  /**
   * List of containers and their properties to return
   */
  sources?: SourceSelector[];
  /**
   * Filter specification
   */
  filter?: RecordFilter;
  /**
   * Sorting specifications
   */
  sort?: RecordSort[];
  /**
   * Maximum number of results to return (default: 10, max: 1000)
   */
  limit?: number;
}

/**
 * A record retrieved from a stream
 */
export interface RecordItem {
  /**
   * The space that the record belongs to
   */
  space: RecordSpaceId;
  /**
   * External ID of the record
   */
  externalId: RecordExternalId;
  /**
   * When the record was created
   */
  createdTime: Date;
  /**
   * When the record was last updated
   */
  lastUpdatedTime: Date;
  /**
   * Properties organized by space -> container -> property
   */
  properties: RecordProperties;
}

/**
 * Properties structure returned from the API
 * Organized as: { [spaceId]: { [containerId]: { [propertyId]: value } } }
 */
export type RecordProperties = {
  [space: string]: {
    [container: string]: PropertyValueGroupV3;
  };
};

/**
 * Response from the filter records endpoint
 */
export interface RecordFilterResponse {
  /**
   * List of records matching the filter
   */
  items: RecordItem[];
}

/**
 * Status of a synced record
 */
export type SyncRecordStatus = 'created' | 'updated' | 'deleted';

/**
 * A record returned from the sync endpoint
 */
export interface SyncRecordItem {
  space: RecordSpaceId;
  externalId: RecordExternalId;
  createdTime: Date;
  lastUpdatedTime: Date;
  /** Properties are omitted for deleted records in mutable streams */
  properties?: RecordProperties;
  status: SyncRecordStatus;
}

/**
 * Request for syncing records from a stream
 */
export interface RecordSyncRequest {
  /** List of containers and their properties to return */
  sources?: SourceSelector[];
  /** Filter specification */
  filter?: RecordFilter;
  /** Cursor from a previous sync request */
  cursor?: string;
  /** Initialize cursor with a time offset (e.g., "2d-ago", "1h-ago") */
  initializeCursor?: string;
  /** Maximum number of results to return (default: 10, max: 1000) */
  limit?: number;
}

/**
 * Response from the sync records endpoint
 */
export interface RecordSyncResponse {
  items: SyncRecordItem[];
  /** Cursor for the next sync request */
  nextCursor: string;
  /** Whether there are more records to sync */
  hasNext: boolean;
}

/**
 * Property reference for aggregates.
 * Either a top-level property (1 element) or a container property [space, container, property] (3 elements).
 */
export type AggregateProperty = [string] | [string, string, string];

/** Moving function types for pipeline aggregates */
export type MovingFunctionType =
  | 'MovingFunctions.max'
  | 'MovingFunctions.min'
  | 'MovingFunctions.sum'
  | 'MovingFunctions.unweightedAvg'
  | 'MovingFunctions.linearWeightedAvg';

/** Calendar interval for time histogram aggregation */
export type CalendarInterval = '1s' | '1m' | '1h' | '1d' | '1w' | '1M' | '1q' | '1y';

/** Hard bounds for histogram aggregates */
export interface HistogramHardBounds {
  min?: number | string;
  max?: number | string;
}

// Metric aggregates
/** Calculates the average from the data stored by the specified property */
export interface AvgAggregate { avg: { property: AggregateProperty } }
/** Counts the number of items (or non-null values when property is specified) */
export interface CountAggregate { count: { property?: AggregateProperty } }
/** Calculates the lowest value for the property */
export interface MinAggregate { min: { property: AggregateProperty } }
/** Calculates the highest value for the property */
export interface MaxAggregate { max: { property: AggregateProperty } }
/** Calculates the sum from the values of the specified property */
export interface SumAggregate { sum: { property: AggregateProperty } }

export type MetricAggregate = AvgAggregate | CountAggregate | MinAggregate | MaxAggregate | SumAggregate;

// Bucket aggregates
/** Groups records by unique property values */
export interface UniqueValuesAggregate {
  uniqueValues: {
    property: AggregateProperty;
    /** Sub-aggregates to apply within each bucket */
    aggregates?: RecordAggregates;
    /** Number of top buckets to return (default: 10, max: 2000) */
    size?: number;
  };
}

/** Generates a histogram from numeric values with specified interval */
export interface NumberHistogramAggregate {
  numberHistogram: {
    property: AggregateProperty;
    /** The interval between each bucket */
    interval: number;
    /** Limit the range of buckets */
    hardBounds?: HistogramHardBounds;
    /** Sub-aggregates to apply within each bucket */
    aggregates?: RecordAggregates;
  };
}

/** Generates a histogram from timestamp values */
export interface TimeHistogramAggregate {
  timeHistogram: {
    property: AggregateProperty;
    /** Calendar interval (mutually exclusive with fixedInterval) */
    calendarInterval?: CalendarInterval;
    /** Fixed interval e.g. '3m', '400h', '25d' (mutually exclusive with calendarInterval) */
    fixedInterval?: string;
    /** Limit the range of buckets */
    hardBounds?: HistogramHardBounds;
    /** Sub-aggregates to apply within each bucket */
    aggregates?: RecordAggregates;
  };
}

/** Groups records by filter criteria into buckets */
export interface FiltersAggregate {
  filters: {
    /** List of filters from which to build buckets (1-10 filters) */
    filters: RecordFilter[];
    /** Sub-aggregates to apply within each bucket */
    aggregates?: RecordAggregates;
  };
}

export type BucketAggregate =
  | UniqueValuesAggregate
  | NumberHistogramAggregate
  | TimeHistogramAggregate
  | FiltersAggregate;

// Pipeline aggregates
/** Applies a function over a sliding window in histogram buckets */
export interface MovingFunctionAggregate {
  movingFunction: {
    /** Path to the metric from parent aggregate (use "_count" for bucket count) */
    bucketsPath: string;
    /** Size of the sliding window */
    window: number;
    /** Function to execute on each window */
    function: MovingFunctionType;
  };
}

export type PipelineAggregate = MovingFunctionAggregate;

/** All aggregate types */
export type RecordAggregate = MetricAggregate | BucketAggregate | PipelineAggregate;

/** Dictionary of aggregates with client-defined identifiers (max 5 per level, max depth 5) */
export type RecordAggregates = Record<string, RecordAggregate>;

/** Request for aggregating records from a stream */
export interface RecordAggregateRequest {
  /** Filter on last updated time. Required for immutable streams. */
  lastUpdatedTime?: LastUpdatedTimeFilter;
  /** Filter specification */
  filter?: RecordFilter;
  /** Dictionary of aggregates with client-defined identifiers */
  aggregates: RecordAggregates;
}

// Aggregate result types
export interface AvgAggregateResult { avg: number }
export interface CountAggregateResult { count: number }
export interface MinAggregateResult { min: number }
export interface MaxAggregateResult { max: number }
export interface SumAggregateResult { sum: number }
export interface MovingFunctionAggregateResult { fnValue: number }

export type MetricAggregateResult =
  | AvgAggregateResult
  | CountAggregateResult
  | MinAggregateResult
  | MaxAggregateResult
  | SumAggregateResult
  | MovingFunctionAggregateResult;

/** Bucket in a unique values aggregate result */
export interface UniqueValueBucket {
  count: number;
  value: RawPropertyValueV3;
  aggregates?: RecordAggregateResults;
}

export interface UniqueValuesAggregateResult {
  uniqueValueBuckets: UniqueValueBucket[];
}

/** Bucket in a number histogram aggregate result */
export interface NumberHistogramBucket {
  count: number;
  intervalStart: number;
  aggregates?: RecordAggregateResults;
}

export interface NumberHistogramAggregateResult {
  numberHistogramBuckets: NumberHistogramBucket[];
}

/** Bucket in a time histogram aggregate result */
export interface TimeHistogramBucket {
  count: number;
  intervalStart: string;
  aggregates?: RecordAggregateResults;
}

export interface TimeHistogramAggregateResult {
  timeHistogramBuckets: TimeHistogramBucket[];
}

/** Bucket in a filters aggregate result */
export interface FilterBucket {
  count: number;
  aggregates?: RecordAggregateResults;
}

export interface FiltersAggregateResult {
  filterBuckets: FilterBucket[];
}

export type BucketAggregateResult =
  | UniqueValuesAggregateResult
  | NumberHistogramAggregateResult
  | TimeHistogramAggregateResult
  | FiltersAggregateResult;

export type RecordAggregateResult = MetricAggregateResult | BucketAggregateResult;

/** Dictionary of aggregate results with identifiers matching the request */
export type RecordAggregateResults = Record<string, RecordAggregateResult>;

/** Response from the aggregate records endpoint */
export interface RecordAggregateResponse {
  aggregates: RecordAggregateResults;
}
