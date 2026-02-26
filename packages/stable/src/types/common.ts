// Copyright 2026 Cognite AS

export type Timestamp = number | Date;

export interface Range<T> {
  min?: T;
  max?: T;
}

export type DateRange = Range<Timestamp>;

export interface Metadata {
  [key: string]: string;
}

export type ExternalIdPrefix = string;

/**
 * Splits the data set into N partitions.
 * This should NOT be used for frontend applications.
 * Partitions are formatted as `n/m`, where `n` is the index of the parititon, and `m` is the total number or partitions.
 * i.e. 20 partitions would have one request with `partition: 1/20`, then another `partition: 2/20` and so on.
 * You need to use `autoPagingToArray(...)` on each partition in order to receive all the data.
 * @example 1/10
 */
export type Partition = string;

export interface CreatedAndLastUpdatedTime {
  lastUpdatedTime: Date;
  createdTime: Date;
}

export interface CreatedAndLastUpdatedTimeFilter {
  lastUpdatedTime?: DateRange;
  createdTime?: DateRange;
}

export interface DatapointInfo {
  timestamp: Date;
}

export interface AggregateResponse {
  /**
   * Size of the aggregation group
   */
  count: number;
}

export type NullableSinglePatchLong = { set: number } | { setNull: true };

export type NullableSinglePatchString = { set: string } | { setNull: true };

export type ObjectPatch<T> =
  | {
      /**
       * Set the key-value pairs. All existing key-value pairs will be removed.
       */
      set: { [key: string]: T };
    }
  | {
      /**
       * Add the key-value pairs. Values for existing keys will be overwritten.
       */
      add: { [key: string]: T };
      /**
       * Remove the key-value pairs with given keys.
       */
      remove: string[];
    };

export type MetadataPatch = ObjectPatch<string>;

export type ArrayPatchLong =
  | { set: number[] }
  | { add?: number[]; remove?: number[] };

export interface IgnoreUnknownIds {
  /**
   * Ignore IDs and external IDs that are not found
   * @default false
   */
  ignoreUnknownIds?: boolean;
}
