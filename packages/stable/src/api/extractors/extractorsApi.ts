// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type ExternalId,
  type MetadataMap,
} from '@cognite/sdk-core';
import type { Extractor, ExtractorSchema, IgnoreUnknownIds } from '../../types';
import { ExtractorSolutionsAPI } from './extractorSolutionsApi';
import { ExtractorSourceSystemsAPI } from './extractorSourceSystemsApi';

export class ExtractorsAPI extends BaseResourceAPI<Extractor> {
  private readonly sourceSystemsApi: ExtractorSourceSystemsAPI;
  private readonly solutionsApi: ExtractorSolutionsAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    super(resourcePath, ...args);
    this.sourceSystemsApi = new ExtractorSourceSystemsAPI(
      this.url('sources'),
      ...args
    );
    this.solutionsApi = new ExtractorSolutionsAPI(
      this.url('solutions'),
      ...args
    );
  }

  /**
   * [Extractor source systems](https://docs.cognite.com/20230101/extractors/list-source-systems)
   */
  public get sourceSystems() {
    return this.sourceSystemsApi;
  }

  /**
   * [Extractor solutions](https://docs.cognite.com/20230101/extractors/list-solutions)
   */
  public get solutions() {
    return this.solutionsApi;
  }

  /**
   * [List extractors](https://docs.cognite.com/20230101/extractors/list-extractors)
   *
   * ```js
   * const extractors = await client.extractors.list();
   * ```
   */
  public list = (): CursorAndAsyncIterator<Extractor> => {
    return super.listEndpoint(this.callListEndpointWithGet);
  };

  /**
   * [Retrieve extractors](https://docs.cognite.com/20230101/extractors/retrieve-extractors)
   *
   * ```js
   * const extractors = await client.extractors.retrieve([
   *   { externalId: 'cognite-pi' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<Extractor[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Get config schema](https://docs.cognite.com/20230101/extractors/get-config-schema)
   *
   * ```js
   * const schema = await client.extractors.getSchema('cognite-pi', '1.2.3');
   * ```
   */
  public getSchema = async (
    extractorExternalId: string,
    version: string
  ): Promise<ExtractorSchema> => {
    const path = this.url(
      `schemas/${encodeURIComponent(extractorExternalId)}/${encodeURIComponent(version)}`
    );
    const response = await this.get<ExtractorSchema>(path);
    return this.addToMapAndReturn(response.data, response);
  };
}
