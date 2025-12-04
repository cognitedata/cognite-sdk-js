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
  filter?: Record<string, unknown>;
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
