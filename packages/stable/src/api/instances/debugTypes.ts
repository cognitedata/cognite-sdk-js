// Copyright 2026 Cognite AS

// Hand-written debug types that sit on top of the generated ones in ./types.gen.ts,
// so the generated file stays untouched and can be regenerated as-is.
//
// The generated `DebugNotice` union is what the OpenAPI document defines. The API adds
// notices without a breaking change, so the response types below type `notices` as the
// loose `UnknownDebugNotice` (the base fields every notice has). Nothing is changed on
// the wire: responses are returned exactly as the API sent them.

import type {
  DebugNotice,
  DebugResponse as GeneratedDebugResponse,
  QueryResponse as GeneratedQueryResponse,
} from './types.gen';

/**
 * A notice as the API returns it, typed only by the fields every notice has. It may be
 * one this SDK version knows ({@link DebugNotice}) or one the API added later. Mirrors
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
