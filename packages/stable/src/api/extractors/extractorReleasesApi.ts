// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds, Release, ReleaseId } from '../../types';
import type { ExtractorReleasesListQuery } from './types';

export class ExtractorReleasesAPI extends BaseResourceAPI<Release> {
  /**
   * [List releases](https://docs.cognite.com/20230101/extractors/list-releases)
   *
   * ```js
   * const releases = await client.extractors.releases.list({ externalId: 'cognite-pi' });
   * ```
   */
  public list = (
    query?: ExtractorReleasesListQuery
  ): CursorAndAsyncIterator<Release> => {
    return super.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve releases](https://docs.cognite.com/20230101/extractors/retrieve-releases)
   *
   * ```js
   * const releases = await client.extractors.releases.retrieve([
   *   { externalId: 'cognite-pi', version: '1.2.3' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ReleaseId[],
    params: IgnoreUnknownIds = {}
  ): Promise<Release[]> => {
    return super.retrieveEndpoint(ids, params);
  };
}
