// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CursorAndAsyncIterator,
  type MetadataMap,
} from '@cognite/sdk-core';
import { DataProductVersionsAPI } from './dataProductVersionsApi';
import type {
  DataProduct,
  DataProductChange,
  DataProductCreate,
  DataProductExternalIdObject,
  DataProductListQuery,
} from './types';

export class DataProductsAPI extends BaseResourceAPI<DataProduct> {
  private readonly versionsApi: DataProductVersionsAPI;

  /** @hidden */
  constructor(resourcePath: string, ...args: [CDFHttpClient, MetadataMap]) {
    super(resourcePath, ...args);
    this.versionsApi = new DataProductVersionsAPI(resourcePath, ...args);
  }

  /**
   * [Data product versions](https://api-docs.cognite.com/20230101/tag/Data-products/operation/listDataProductVersions)
   */
  public get versions() {
    return this.versionsApi;
  }

  /**
   * [Create data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/createDataProduct)
   *
   * ```js
   * const dataProducts = await client.dataProducts.create([
   *   {
   *     externalId: 'my-data-product',
   *     name: 'My Data Product',
   *   },
   * ]);
   * ```
   */
  public create = (items: [DataProductCreate]): Promise<DataProduct[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/listDataProducts)
   *
   * ```js
   * const dataProducts = await client.dataProducts.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: DataProductListQuery
  ): CursorAndAsyncIterator<DataProduct> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Retrieve data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/getDataProductsByIds)
   *
   * ```js
   * const dataProducts = await client.dataProducts.retrieve([
   *   { externalId: 'my-data-product' },
   * ]);
   * ```
   */
  public retrieve = (
    ids: DataProductExternalIdObject[]
  ): Promise<DataProduct[]> => {
    return this.callEndpointWithMergeAndTransform(ids, (data) =>
      this.postInParallelWithAutomaticChunking({
        path: this.byIdsUrl,
        items: data,
        chunkSize: 100,
      })
    );
  };

  /**
   * [Update data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/updateDataProduct)
   *
   * ```js
   * const updated = await client.dataProducts.update([
   *   {
   *     externalId: 'my-data-product',
   *     update: {
   *       description: { set: 'Updated description' },
   *     },
   *   },
   * ]);
   * ```
   */
  public update = (items: [DataProductChange]): Promise<DataProduct[]> => {
    return this.updateEndpoint(items);
  };

  /**
   * [Delete data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/deleteDataProduct)
   *
   * ```js
   * await client.dataProducts.delete([{ externalId: 'my-data-product' }]);
   * ```
   */
  public delete = (ids: [DataProductExternalIdObject]): Promise<object> => {
    return this.deleteEndpoint(ids);
  };
}
