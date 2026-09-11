// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds, Solution } from '../../types';

export class ExtractorSolutionsAPI extends BaseResourceAPI<Solution> {
  /**
   * [List solutions](https://docs.cognite.com/20230101/extractors/list-solutions)
   *
   * ```js
   * const solutions = await client.extractors.solutions.list();
   * ```
   */
  public list = (): CursorAndAsyncIterator<Solution> => {
    return super.listEndpoint(this.callListEndpointWithGet);
  };

  /**
   * [Retrieve solutions](https://docs.cognite.com/20230101/extractors/retrieve-solutions)
   *
   * ```js
   * const solutions = await client.extractors.solutions.retrieve([
   *   { externalId: 'cognite-pi-pi' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<Solution[]> => {
    return super.retrieveEndpoint(ids, params);
  };
}
