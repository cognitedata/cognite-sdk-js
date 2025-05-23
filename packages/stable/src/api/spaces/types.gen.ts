// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

import type { CursorAndAsyncIterator } from '@cognite/sdk-core';
export interface CursorQueryParameter {
  /** @example 4zj0Vy2fo0NtNMb229mI9r1V3YG5NBL752kQz1cKtwo */
  cursor?: string;
}
/**
 * The number of milliseconds since 00:00:00 Thursday, 1 January 1970, Coordinated Universal Time (UTC), minus leap seconds.
 * @format int64
 * @min 0
 * @example 1730204346000
 */
export type EpochTimestamp = number;
export interface IncludeGlobalQueryParameter {
  includeGlobal?: boolean;
}
export interface ListOfSpaceIdsRequest {
  items: {
    space: SpaceSpecification;
  }[];
}
export interface ListOfSpaceIdsResponse {
  items: {
    space: SpaceSpecification;
  }[];
}
/**
 * The cursor value used to return (paginate to) the next page of results, when more data is available.
 */
export type NextCursorV3 = string;
export interface ReducedLimitQueryParameter {
  /**
   * @min 1
   * @max 1000
   */
  limit?: number;
}
export interface SpaceCollectionResponseV3Response {
  /** List of spaces */
  items: SpaceDefinition[];
}
export interface SpaceCollectionResponseWithCursorResponse
  extends CursorAndAsyncIterator<SpaceDefinition> {}
export interface SpaceCreateCollection {
  /** List of spaces to create/update */
  items: SpaceCreateDefinition[];
}
export interface SpaceCreateDefinition {
  /** Used to describe the space you're defining. */
  description?: string;
  /** Human-readable name for the space. */
  name?: string;
  /**
   * The Space identifier (id).
   *
   * Note that we have reserved the use of certain space ids.  These reserved spaces are:
   *  * `space`
   *  * `cdf`
   *  * `dms`
   *  * `pg3`
   *  * `shared`
   *  * `system`
   *  * `node`
   *  * `edge`
   *
   * @pattern (?!^(space|cdf|dms|pg3|shared|system|node|edge)$)(^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$)
   */
  space: string;
}
export type SpaceDefinition = SpaceCreateDefinition & {
  createdTime: EpochTimestamp;
  lastUpdatedTime: EpochTimestamp;
  isGlobal: boolean;
};
/**
 * @pattern ^[a-zA-Z][a-zA-Z0-9_-]{0,41}[a-zA-Z0-9]?$
 */
export type SpaceSpecification = string;
export interface UpsertConflict {
  /** Details about the error caused by the upsert/update. */
  error: {
    code: number;
    message: string;
  };
}
