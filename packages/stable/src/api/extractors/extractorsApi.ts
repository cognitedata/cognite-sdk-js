// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { ExtractorSchema } from './types';
import type { Extractor } from './types.gen';

export class ExtractorsAPI extends BaseResourceAPI<Extractor> {
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
