// Copyright 2026 Cognite AS

// Hand-written query types that sit on top of the generated ones in ./types.gen.ts, so
// the generated file stays untouched and can be regenerated as-is.

import type { DebugResponse } from './debugTypes';
import type { QueryResponse as GeneratedQueryResponse } from './types.gen';

/** Response of `instances.query` and `instances.sync`, with {@link DebugResponse}. */
export interface QueryResponse extends Omit<GeneratedQueryResponse, 'debug'> {
  /** Contains debug notices if debug flag is set in the query. */
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
