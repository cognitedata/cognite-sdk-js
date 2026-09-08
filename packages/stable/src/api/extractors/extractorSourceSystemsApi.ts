// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { SourceSystem } from './types';

export class ExtractorSourceSystemsAPI extends BaseResourceAPI<SourceSystem> {
  /**
   * [List source systems](https://docs.cognite.com/20230101/extractors/list-source-systems)
   *
   * ```js
   * const sourceSystems = await client.extractors.sourceSystems.list();
   * ```
   */
  public list = (): CursorAndAsyncIterator<SourceSystem> => {
    return super.listEndpoint(this.callListEndpointWithGet);
  };

  /**
   * [Retrieve source systems](https://docs.cognite.com/20230101/extractors/retrieve-source-systems)
   *
   * ```js
   * const sourceSystems = await client.extractors.sourceSystems.retrieve([
   *   { externalId: 'cognite-pi' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<SourceSystem[]> => {
    return super.retrieveEndpoint(ids, params);
  };
}
