// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  DataProduct,
  DataProductChange,
  DataProductCreate,
  DataProductDelete,
  DataProductListQuery,
} from './types';

export class DataProductsAPI extends BaseResourceAPI<DataProduct> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
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
  public create = (items: DataProductCreate[]): Promise<DataProduct[]> => {
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
   * [Retrieve a data product by external id](https://api-docs.cognite.com/20230101/tag/Data-products/operation/getDataProduct)
   *
   * ```js
   * const dataProduct = await client.dataProducts.retrieve('my-data-product');
   * ```
   */
  public retrieve = async (
    externalId: CogniteExternalId
  ): Promise<DataProduct> => {
    const response = await this.get<DataProduct>(
      this.url(encodeURIComponent(externalId))
    );
    return this.addToMapAndReturn(response.data, response);
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
  public update = (items: DataProductChange[]): Promise<DataProduct[]> => {
    return this.updateEndpoint(items, this.url('update'));
  };

  /**
   * [Delete data products](https://api-docs.cognite.com/20230101/tag/Data-products/operation/deleteDataProduct)
   *
   * ```js
   * await client.dataProducts.delete([{ externalId: 'my-data-product' }]);
   * ```
   */
  public delete = (ids: DataProductDelete[]): Promise<{}> => {
    return this.deleteEndpoint(ids);
  };
}
