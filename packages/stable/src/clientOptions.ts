// Copyright 2026 Cognite AS

import type { ClientOptions as CoreClientOptions } from '@cognite/sdk-core';
import type { DataModelingConcurrencyOptions } from './api/dataModeling/concurrency';

export type ConcurrencyOptions = {
  /**
   * Maximum concurrent HTTP attempts per Data Modeling category, per client.
   * Omitted categories use `DEFAULT_DATA_MODELING_CONCURRENCY`.
   *
   * See the [concurrency guide](https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/README.md#concurrency)
   * for operation categories, configuration examples, and limitations.
   */
  dataModeling?: DataModelingConcurrencyOptions;
};

export interface ClientOptions extends Omit<CoreClientOptions, 'concurrency'> {
  /** Per-API request concurrency limits. */
  concurrency?: ConcurrencyOptions;
}
