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
   *
   * @alpha This functionality is experimental. Breaking changes are to be expected
   * in any release, including patch and minor versions.
   */
  dataModeling?: DataModelingConcurrencyOptions;
};

export interface ClientOptions extends Omit<CoreClientOptions, 'concurrency'> {
  /**
   * Opt-in per-API request concurrency limits. Requests are not limited unless
   * this is set; `{}` enables the default limits.
   *
   * @alpha This functionality is experimental. Breaking changes are to be expected
   * in any release, including patch and minor versions.
   */
  concurrency?: ConcurrencyOptions;
}
