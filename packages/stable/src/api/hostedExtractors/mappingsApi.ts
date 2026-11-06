// Copyright 2026 Cognite AS

import type {
  CursorAndAsyncIterator,
  ExternalId,
  FilterQuery,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type { HostedExtractorDeleteParams } from './commonTypes';
import { HostedExtractorResourceAPI } from './hostedExtractorResourceApi';
import type {
  HostedExtractorMapping,
  HostedExtractorMappingChange,
  HostedExtractorMappingCreate,
} from './mappingsTypes';

export class HostedExtractorMappingsAPI extends HostedExtractorResourceAPI<HostedExtractorMapping> {
  /**
   * [Create mappings](https://api-docs.cognite.com/20230101/tag/Mappings/operation/create_mappings)
   *
   * ```js
   * const mappings = await client.hostedExtractors.mappings.create([
   *   {
   *     externalId: 'my-mapping',
   *     mapping: { expression: '{ "value": input.value }' },
   *     input: { type: 'csv', delimiter: ';' },
   *     published: true,
   *   },
   * ]);
   * ```
   */
  public create = (
    items: HostedExtractorMappingCreate[]
  ): Promise<HostedExtractorMapping[]> => {
    return this.createInChunks(items);
  };

  /**
   * [List mappings](https://api-docs.cognite.com/20230101/tag/Mappings/operation/list_mappings)
   *
   * ```js
   * const mappings = await client.hostedExtractors.mappings
   *   .list()
   *   .autoPagingToArray({ limit: Infinity });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<HostedExtractorMapping> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve mappings](https://api-docs.cognite.com/20230101/tag/Mappings/operation/retrieve_mappings)
   *
   * ```js
   * const mappings = await client.hostedExtractors.mappings.retrieve([
   *   { externalId: 'my-mapping' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<HostedExtractorMapping[]> => {
    return this.retrieveInChunks(ids, params);
  };

  /**
   * [Update mappings](https://api-docs.cognite.com/20230101/tag/Mappings/operation/update_mappings)
   *
   * ```js
   * const mappings = await client.hostedExtractors.mappings.update([
   *   {
   *     externalId: 'my-mapping',
   *     update: { published: { set: false }, input: { setNull: true } },
   *   },
   * ]);
   * ```
   */
  public update = (
    changes: HostedExtractorMappingChange[]
  ): Promise<HostedExtractorMapping[]> => {
    return this.updateInChunks(changes);
  };

  /**
   * [Delete mappings](https://api-docs.cognite.com/20230101/tag/Mappings/operation/delete_mappings)
   *
   * ```js
   * await client.hostedExtractors.mappings.delete(
   *   [{ externalId: 'my-mapping' }],
   *   { ignoreUnknownIds: true, force: true }
   * );
   * ```
   */
  public delete = (
    ids: ExternalId[],
    params: HostedExtractorDeleteParams = {}
  ): Promise<object> => {
    return this.deleteInChunks(ids, params);
  };
}
