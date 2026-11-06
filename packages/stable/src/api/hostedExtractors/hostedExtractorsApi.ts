// Copyright 2026 Cognite AS

import type { CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { HostedExtractorDestinationsAPI } from './destinationsApi';
import { HostedExtractorSourcesAPI } from './sourcesApi';

/**
 * [Hosted extractors](https://api-docs.cognite.com/20230101/tag/Sources). This
 * API has no endpoints of its own; use its sub-APIs.
 */
export class HostedExtractorsAPI {
  private readonly sourcesApi: HostedExtractorSourcesAPI;
  private readonly destinationsApi: HostedExtractorDestinationsAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    this.sourcesApi = new HostedExtractorSourcesAPI(
      `${resourcePath}/sources`,
      ...args
    );
    this.destinationsApi = new HostedExtractorDestinationsAPI(
      `${resourcePath}/destinations`,
      ...args
    );
  }

  /**
   * [Sources](https://api-docs.cognite.com/20230101/tag/Sources): the brokers,
   * event hubs and REST servers that hosted extractors read from.
   *
   * ```js
   * const sources = await client.hostedExtractors.sources.list();
   * ```
   */
  public get sources() {
    return this.sourcesApi;
  }

  /**
   * [Destinations](https://api-docs.cognite.com/20230101/tag/Destinations): the
   * CDF sessions and data sets that hosted extractors write to.
   *
   * ```js
   * const destinations = await client.hostedExtractors.destinations.list();
   * ```
   */
  public get destinations() {
    return this.destinationsApi;
  }
}
