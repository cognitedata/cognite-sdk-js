// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  DataProductVersion,
  DataProductVersionChange,
  DataProductVersionCreate,
  DataProductVersionDelete,
  DataProductVersionListQuery,
} from './types';

export class DataProductVersionsAPI extends BaseResourceAPI<DataProductVersion> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  private versionsPath(dataProductExternalId: CogniteExternalId) {
    return this.url(`${encodeURIComponent(dataProductExternalId)}/versions`);
  }

  /**
   * [Create a data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/createDataProductVersion)
   *
   * ```js
   * const versions = await client.dataProductVersions.create('my-data-product', [
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
    dataProductExternalId: CogniteExternalId,
    items: [DataProductVersionCreate]
  ): Promise<DataProductVersion[]> => {
    return this.createEndpoint(items, this.versionsPath(dataProductExternalId));
  };

  /**
   * [List data product versions](https://api-docs.cognite.com/20230101/tag/Data-products/operation/listDataProductVersions)
   *
   * ```js
   * const versions = await client.dataProductVersions.list('my-data-product', {
   *   limit: 10,
   * });
   * ```
   */
  public list = (
    dataProductExternalId: CogniteExternalId,
    query?: DataProductVersionListQuery
  ): CursorAndAsyncIterator<DataProductVersion> => {
    const path = this.versionsPath(dataProductExternalId);
    return this.listEndpoint((params) => this.get(path, { params }), query);
  };

  /**
   * [Get a data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/getDataProductVersion)
   *
   * ```js
   * const version = await client.dataProductVersions.retrieve(
   *   'my-data-product',
   *   '1.0.0'
   * );
   * ```
   */
  public retrieve = async (
    dataProductExternalId: CogniteExternalId,
    version: string
  ): Promise<DataProductVersion> => {
    const path = `${this.versionsPath(dataProductExternalId)}/${encodeURIComponent(version)}`;
    const response = await this.get<DataProductVersion>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Update data product version](https://api-docs.cognite.com/20230101/tag/Data-products/operation/updateDataProductVersion)
   *
   * ```js
   * const updated = await client.dataProductVersions.update('my-data-product', [
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
    dataProductExternalId: CogniteExternalId,
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
   * await client.dataProductVersions.delete('my-data-product', [
   *   { version: '1.0.0' },
   * ]);
   * ```
   */
  public delete = (
    dataProductExternalId: CogniteExternalId,
    ids: DataProductVersionDelete[]
  ): Promise<object> => {
    return this.deleteEndpoint(
      ids,
      undefined,
      `${this.versionsPath(dataProductExternalId)}/delete`
    );
  };
}
