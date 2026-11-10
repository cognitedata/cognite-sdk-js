// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  TransformationQueryRunRequest,
  TransformationQueryRunResult,
} from './types';

export class TransformationQueryAPI extends BaseResourceAPI<unknown> {
  /**
   * [Run query](https://api-docs.cognite.com/20230101/tag/Query/operation/runPreview)
   *
   * Runs a SQL query and returns the inferred schema and the first rows of the result.
   *
   * ```js
   * const { schema, results } = await client.transformations.query.run({
   *   query: 'select * from `db`.`table`',
   *   convertToString: false,
   *   limit: 100,
   * });
   * ```
   */
  public run = async (
    request: TransformationQueryRunRequest
  ): Promise<TransformationQueryRunResult> => {
    const response = await this.post<TransformationQueryRunResult>(
      this.url('run'),
      { data: request }
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
