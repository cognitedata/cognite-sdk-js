// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { CursorAndAsyncIterator, FilterQuery } from '@cognite/sdk-core';
import type {
  TransformationExternalData,
  TransformationExternalDataCreate,
  TransformationExternalDataDelete,
  TransformationExternalDataUsability,
  TransformationExternalDataUsabilityRequest,
} from './types';

export class TransformationsExternalDataAPI extends BaseResourceAPI<TransformationExternalData> {
  /**
   * [Create external data sources](https://api-docs.cognite.com/20230101-beta/tag/Transformation-External-Data-Sources/operation/createExternalDataSources)
   *
   * ```js
   * const sources = await client.transformationsExternalData.create([
   *   {
   *     externalId: 'my-fabric-source',
   *     name: 'Fabric - production lakehouse',
   *     format: 'one_lake',
   *     dataSetId: null,
   *     settings: {
   *       credentials: {
   *         clientId: 'client-id',
   *         tenantId: 'tenant-id',
   *         clientSecret: 'client-secret',
   *       },
   *       locationDescription: {
   *         workspaceId: 'workspace-id',
   *         containerId: 'container-id',
   *       },
   *     },
   *   },
   * ]);
   * ```
   */
  public create = (
    items: TransformationExternalDataCreate[]
  ): Promise<TransformationExternalData[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List external data sources](https://api-docs.cognite.com/20230101-beta/tag/Transformation-External-Data-Sources/operation/listExternalDataSources)
   *
   * ```js
   * const sources = await client.transformationsExternalData.list({ limit: 10 });
   * ```
   */
  public list = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<TransformationExternalData> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Delete external data sources](https://api-docs.cognite.com/20230101-beta/tag/Transformation-External-Data-Sources/operation/deleteExternalDataSources)
   *
   * ```js
   * await client.transformationsExternalData.delete([
   *   { externalId: 'my-fabric-source' },
   * ]);
   * ```
   */
  public delete = (ids: TransformationExternalDataDelete[]) => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [Verify external data source usability](https://api-docs.cognite.com/20230101-beta/tag/Transformation-External-Data-Sources/operation/verifyExternalDataSourceUsability)
   *
   * ```js
   * const status = await client.transformationsExternalData.usability({
   *   externalId: 'my-fabric-source',
   * });
   * ```
   */
  public usability = async (
    request: TransformationExternalDataUsabilityRequest
  ): Promise<TransformationExternalDataUsability> => {
    const response = await this.post<TransformationExternalDataUsability>(
      this.url('usability'),
      { data: request }
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
