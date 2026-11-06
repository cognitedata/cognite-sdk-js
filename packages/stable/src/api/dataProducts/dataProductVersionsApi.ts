// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  DataProductExternalId,
  DataProductSemanticVersion,
  DataProductVersion,
  DataProductVersionChange,
  DataProductVersionCreate,
  DataProductVersionIdentifier,
  DataProductVersionListQuery,
} from './types';

export class DataProductVersionsAPI extends BaseResourceAPI<DataProductVersion> {
  /**
   * [Create a data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/createDataProductVersion)
   *
   * ```js
   * const versions = await client.dataProducts.versions.create('my-data-product', [
   *   {
   *     version: '1.0.0',
   *     views: [
   *       { space: 'my-space', externalId: 'my-view', version: '1' },
   *     ],
   *   },
   * ]);
   * ```
   */
  public create = (
    dataProductExternalId: DataProductExternalId,
    items: [DataProductVersionCreate]
  ): Promise<DataProductVersion[]> => {
    return this.createEndpoint(items, this.versionsPath(dataProductExternalId));
  };

  /**
   * [List data product versions](https://api-docs.cognite.com/20230101/tag/Data-products/operation/listDataProductVersions)
   *
   * ```js
   * const versions = await client.dataProducts.versions.list('my-data-product', {
   *   limit: 10,
   * });
   * ```
   */
  public list = (
    dataProductExternalId: DataProductExternalId,
    query?: DataProductVersionListQuery
  ): CursorAndAsyncIterator<DataProductVersion> => {
    const path = this.versionsPath(dataProductExternalId);
    return this.listEndpoint((params) => this.get(path, { params }), query);
  };

  /**
   * [Get a data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/getDataProductVersion)
   *
   * ```js
   * const version = await client.dataProducts.versions.retrieve(
   *   'my-data-product',
   *   '1.0.0'
   * );
   * ```
   */
  public retrieve = async (
    dataProductExternalId: DataProductExternalId,
    version: DataProductSemanticVersion
  ): Promise<DataProductVersion> => {
    const path = `${this.versionsPath(dataProductExternalId)}/${encodeURIComponent(version)}`;
    const response = await this.get<DataProductVersion>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Update a data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/updateDataProductVersion)
   *
   * ```js
   * const updated = await client.dataProducts.versions.update('my-data-product', [
   *   {
   *     version: '1.0.0',
   *     update: {
   *       description: { set: 'Updated description' },
   *       status: { set: 'published' },
   *     },
   *   },
   * ]);
   * ```
   */
  public update = (
    dataProductExternalId: DataProductExternalId,
    items: [DataProductVersionChange]
  ): Promise<DataProductVersion[]> => {
    return this.updateEndpoint(
      items,
      `${this.versionsPath(dataProductExternalId)}/update`
    );
  };

  /**
   * [Delete data product versions](https://api-docs.cognite.com/20230101/tag/Data-products/operation/deleteDataProductVersions)
   *
   * ```js
   * await client.dataProducts.versions.delete('my-data-product', [
   *   { version: '1.0.0' },
   * ]);
   * ```
   */
  public delete = (
    dataProductExternalId: DataProductExternalId,
    ids: DataProductVersionIdentifier[]
  ): Promise<object> => {
    return this.deleteEndpoint(
      ids,
      undefined,
      `${this.versionsPath(dataProductExternalId)}/delete`
    );
  };

  private versionsPath(dataProductExternalId: DataProductExternalId) {
    return this.url(`${encodeURIComponent(dataProductExternalId)}/versions`);
  }
}
