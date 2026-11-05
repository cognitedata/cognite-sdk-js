// Copyright 2026 Cognite AS

// Hand-written debug types that sit on top of the generated ones in ./types.gen.ts,
// so the generated file stays untouched and can be regenerated as-is.
//
// The generated `DebugNotice` union is what the OpenAPI document defines. The API adds
// notices without a breaking change, so at runtime (see ./debugNotices.ts, modelled on
// the Python SDK's `DebugNotice._load`) every notice whose (`category`, `code`) pair the
// SDK does not know is returned as an `UnknownDebugNotice`. The response types below
// widen `notices` accordingly. Everything else is derived from the generated types, so
// new generated fields are picked up automatically.

import type {
  DebugNotice,
  DebugResponse as GeneratedDebugResponse,
  QueryResponse as GeneratedQueryResponse,
} from './types.gen';

/**
 * A notice whose (`category`, `code`) pair is not known to this SDK version, e.g. one
 * the API added after this SDK was released. Mirrors `UnknownDebugNotice` in the Python
 * SDK: the base fields are lifted out and every other field is kept verbatim in `data`.
 * Use `isUnknownDebugNotice` to tell it apart from the known {@link DebugNotice}s.
 */
export interface UnknownDebugNotice {
  category: string;
  code: string;
  hint: string;
  level: string;
  /** All remaining fields of the notice as returned by the API. */
  data: Record<string, unknown>;
}

/**
 * Contains debug notices if debug flag is set in the query. Like the generated
 * `DebugResponse`, but notices the SDK does not know are {@link UnknownDebugNotice}s.
 */
export interface DebugResponse extends Omit<GeneratedDebugResponse, 'notices'> {
  /** A list of notices that provide insights into the query's execution. These can highlight potential performance issues, offer optimization suggestions, or explain aspects of the query processing. Each notice falls into a category, such as indexing, sorting, filtering, or cursoring, to help identify areas for improvement. */
  notices?: (DebugNotice | UnknownDebugNotice)[];
}

/** Response of `instances.query` and `instances.sync`, with {@link DebugResponse}. */
export interface QueryResponse extends Omit<GeneratedQueryResponse, 'debug'> {
  /** Contains debug notices if debug flag is set in the query. */
  debug?: DebugResponse;
}

// Compile-time proof that the wrappers above stay compatible with the generated types:
// the generated shapes must be assignable to ours. If a regeneration changes the spec
// shape in an incompatible way, these fail to compile.
type Assert<T extends true> = T;
export type _DebugResponseComplies = Assert<
  GeneratedDebugResponse extends DebugResponse ? true : false
>;
export type _QueryResponseComplies = Assert<
  GeneratedQueryResponse extends QueryResponse ? true : false
>;
