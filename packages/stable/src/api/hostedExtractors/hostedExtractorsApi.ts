// Copyright 2026 Cognite AS

import type { CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { HostedExtractorSourcesAPI } from './sourcesApi';

/**
 * [Hosted extractors](https://api-docs.cognite.com/20230101/tag/Sources). This
 * API has no endpoints of its own; use its sub-APIs.
 */
export class HostedExtractorsAPI {
  private readonly sourcesApi: HostedExtractorSourcesAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    this.sourcesApi = new HostedExtractorSourcesAPI(
      `${resourcePath}/sources`,
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
}
