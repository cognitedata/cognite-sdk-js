// Copyright 2026 Cognite AS

// Hand-written debug types that sit on top of the generated ones in ./types.gen.ts,
// so the generated file stays untouched and can be regenerated as-is.
//
// The generated `DebugNotice` union is what the OpenAPI document defines. The API adds
// notices without a breaking change, so the response types below type `notices` as the
// loose `UnknownDebugNotice` (the base fields every notice has) and `isKnownDebugNotice`
// narrows a notice to the generated union. Nothing is changed on the wire: responses
// are returned exactly as the API sent them.

import type {
  DebugNotice,
  DebugResponse as GeneratedDebugResponse,
  QueryResponse as GeneratedQueryResponse,
} from './types.gen';

/**
 * A notice as the API returns it, typed only by the fields every notice has. It may be
 * one this SDK version knows ({@link DebugNotice}) or one the API added later; use
 * {@link isKnownDebugNotice} to narrow to the known ones. Mirrors `DebugNotice` /
 * `UnknownDebugNotice` in the Python SDK.
 */
export interface UnknownDebugNotice {
  category: string;
  code: string;
  hint: string;
  level: string;
}

/**
 * Contains debug notices if debug flag is set in the query. Like the generated
 * `DebugResponse`, but `notices` are {@link UnknownDebugNotice}s.
 */
export interface DebugResponse extends Omit<GeneratedDebugResponse, 'notices'> {
  /** A list of notices that provide insights into the query's execution. These can highlight potential performance issues, offer optimization suggestions, or explain aspects of the query processing. Each notice falls into a category, such as indexing, sorting, filtering, or cursoring, to help identify areas for improvement. */
  notices?: UnknownDebugNotice[];
}

/** Response of `instances.query` and `instances.sync`, with {@link DebugResponse}. */
export interface QueryResponse extends Omit<GeneratedQueryResponse, 'debug'> {
  /** Contains debug notices if debug flag is set in the query. */
  debug?: DebugResponse;
}

/**
 * Every (`category`, `code`) pair the SDK has a typed `DebugNotice` for. The key type is
 * derived from the `DebugNotice` union, so adding a notice to the generated types
 * without listing it here is a compile error (and so is leaving a stale entry behind).
 */
const KNOWN_DEBUG_NOTICES: {
  [N in DebugNotice as `${N['category']}/${N['code']}`]: true;
} = {
  'invalidDebugOptions/excessiveTimeout': true,
  'invalidDebugOptions/noTimeoutWithResults': true,
  'sorting/sortNotBackedByIndex': true,
  'sorting/suggestedCursorableSort': true,
  'sorting/filterMatchesCursorableSort': true,
  'sorting/filterMatchesBrokenCursorableIndex': true,
  'indexing/unindexedThrough': true,
  'indexing/containersWithoutIndexesInvolved': true,
  'indexing/filterIncompatibleWithCursorableIndexScan': true,
  'filtering/selectiveExternalIDFilter': true,
  'filtering/significantPostFiltering': true,
  'filtering/significantHasDataFiltering': true,
  'filtering/unfilteredContainerScan': true,
  'cursoring/intractableDirectRelationsCursor': true,
  'cursoring/intractableCursorWithNestedFilter': true,
  'sync/syncMissingSpaceFilter': true,
};

/**
 * Type guard for notices this SDK version has a typed shape for, so they can be
 * narrowed further on `code`:
 *
 * ```js
 * for (const notice of response.debug?.notices ?? []) {
 *   if (isKnownDebugNotice(notice) && notice.code === 'unindexedThrough') {
 *     console.log(notice.property);
 *   }
 * }
 * ```
 */
export const isKnownDebugNotice = (
  notice: UnknownDebugNotice
): notice is DebugNotice =>
  Object.prototype.hasOwnProperty.call(
    KNOWN_DEBUG_NOTICES,
    `${notice.category}/${notice.code}`
  );

// Compile-time proof that the wrappers above stay compatible with the generated types:
// the generated shapes must be assignable to ours. If a regeneration changes the spec
// shape in an incompatible way, these fail to compile. Exported only because
// `noUnusedLocals` is on; they are not re-exported from the package entry point.
type Assert<T extends true> = T;
export type _DebugResponseComplies = Assert<
  GeneratedDebugResponse extends DebugResponse ? true : false
>;
export type _QueryResponseComplies = Assert<
  GeneratedQueryResponse extends QueryResponse ? true : false
>;
