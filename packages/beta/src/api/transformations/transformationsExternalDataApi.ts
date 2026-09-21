// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  FilterQuery,
} from '@cognite/sdk-core';
import type {
  TransformationExternalData,
  TransformationExternalDataCreate,
  TransformationExternalDataDelete,
  TransformationExternalDataUsability,
  TransformationExternalDataUsabilityRequest,
} from './types';

export class TransformationsExternalDataAPI extends BaseResourceAPI<TransformationExternalData> {
  /**
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
