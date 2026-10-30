// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  DataDomain,
  DataDomainChange,
  DataDomainCreate,
  DataDomainExternalIdObject,
  DataDomainListQuery,
} from './types';

export class DataDomainsAPI extends BaseResourceAPI<DataDomain> {
  /**
   * [Create data domains](https://api-docs.cognite.com/20230101-alpha/tag/Data-domains/operation/createDataDomain)
   *
   * ```js
   * const dataDomains = await client.dataDomains.create([
   *   {
   *     externalId: 'my-data-domain',
   *     name: 'My Data Domain',
   *   },
   * ]);
   * ```
   */
  public create = (items: [DataDomainCreate]): Promise<DataDomain[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List data domains](https://api-docs.cognite.com/20230101-alpha/tag/Data-domains/operation/listDataDomains)
   *
   * ```js
   * const dataDomains = await client.dataDomains.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: DataDomainListQuery
  ): CursorAndAsyncIterator<DataDomain> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve data domains](https://api-docs.cognite.com/20230101-alpha/tag/Data-domains/operation/getDataDomainsByIds)
   *
   * ```js
   * const dataDomains = await client.dataDomains.retrieve([
   *   { externalId: 'my-data-domain' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: DataDomainExternalIdObject[]
  ): Promise<DataDomain[]> => {
    return this.callEndpointWithMergeAndTransform(ids, (data) =>
      this.postInParallelWithAutomaticChunking({
        path: this.byIdsUrl,
        items: data,
        chunkSize: 100,
      })
    );
  };

  /**
   * [Update data domains](https://api-docs.cognite.com/20230101-alpha/tag/Data-domains/operation/updateDataDomain)
   *
   * ```js
   * const updated = await client.dataDomains.update([
   *   {
   *     externalId: 'my-data-domain',
   *     update: {
   *       description: { set: 'Updated description' },
   *     },
   *   },
   * ]);
   * ```
   */
  public update = (items: [DataDomainChange]): Promise<DataDomain[]> => {
    return this.updateEndpoint(items);
  };

  /**
   * [Delete data domains](https://api-docs.cognite.com/20230101-alpha/tag/Data-domains/operation/deleteDataDomain)
   *
   * ```js
   * await client.dataDomains.delete([{ externalId: 'my-data-domain' }]);
   * ```
   */
  public delete = (ids: [DataDomainExternalIdObject]): Promise<object> => {
    return this.deleteEndpoint(ids);
  };
}
