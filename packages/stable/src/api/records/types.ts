// Copyright 2025 Cognite AS

import type {
  ContainerReference,
  PropertyValueGroupV3,
  RawPropertyValueV3,
} from '../instances/types.gen';

export type { ContainerReference, PropertyValueGroupV3, RawPropertyValueV3 };

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
  space: string;
  /**
   * External ID of the record
   */
  externalId: string;
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
  gte?: string | number;
  /**
   * Greater than
   */
  gt?: string | number;
  /**
   * Less than or equal to
   */
  lte?: string | number;
  /**
   * Less than
   */
  lt?: string | number;
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
  direction?: 'ascending' | 'descending';
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
  space: string;
  /**
   * External ID of the record
   */
  externalId: string;
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