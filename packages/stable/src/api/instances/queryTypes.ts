// Copyright 2026 Cognite AS

// Hand-written query types that sit on top of the generated ones in ./types.gen.ts, so
// the generated file stays untouched and can be regenerated as-is.

import type { DebugResponse, UnknownDebugNotice } from './debugTypes';
import type { QueryResponse as GeneratedQueryResponse } from './types.gen';

/** Response of `instances.query` and `instances.sync`, with {@link DebugResponse}. */
export interface QueryResponse extends Omit<GeneratedQueryResponse, 'debug'> {
  /**
   * Contains debug notices if debug flag is set in the query.
   *
   * The notices are deliberately typed wide ({@link UnknownDebugNotice}): you can narrow
   * them (for example by `code`, or against `DebugNotice`), but do not depend on the
   * narrow notice types. Debug notices are volatile: the API adds, changes and removes
   * them without that being a breaking change, so code that relies on a specific notice
   * or shape may break at any time. Treat them as diagnostic output for humans and
   * tooling, not as a stable contract.
   */
  debug?: DebugResponse;
}

// Compile-time proof that the wrapper above stays compatible with the generated type:
// the generated shape must be assignable to ours. If a regeneration changes the spec
// shape in an incompatible way, this fails to compile. Exported only because
// `noUnusedLocals` is on; it is not re-exported from the package entry point.
type Assert<T extends true> = T;
export type _QueryResponseComplies = Assert<
  GeneratedQueryResponse extends QueryResponse ? true : false
>;
