// Copyright 2026 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteExternalId,
  CursorAndAsyncIterator,
  ItemsWrapper,
} from '@cognite/sdk-core';
import type {
  TransformationExternalData,
  TransformationExternalDataCreate,
  TransformationExternalDataDelete,
  TransformationExternalDataListQuery,
  TransformationExternalDataRotateKeysItem,
  TransformationExternalDataRotatedKey,
  TransformationExternalDataUsability,
  TransformationExternalDataUsabilityRequest,
} from './types';

export class TransformationsExternalDataAPI extends BaseResourceAPI<TransformationExternalData> {
  /**
   * ```js
   * const sources = await client.transformationsExternalData.create([
   *   {
   *     externalId: 'snowflake-sales-prod',
   *     name: 'Snowflake Sales (prod)',
   *     format: 'snowflake',
   *     dataSetId: 3627849102345678,
   *     settings: {
   *       credentials: {
   *         accountIdentifier: 'myorg-myaccount',
   *         userName: 'COGNITE_TRANSFORMATIONS_SVC',
   *         roleName: 'COGNITE_TRANSFORMATIONS_ROLE',
   *       },
   *       locationDescription: {
   *         warehouseName: 'COGNITE_WH',
   *       },
   *     },
   *     expiryTime: 1692374400000,
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
   * const sources = await client.transformationsExternalData.list({
   *   limit: 50,
   *   format: 'snowflake',
   * });
   * ```
   */
  public list = (
    query?: TransformationExternalDataListQuery
  ): CursorAndAsyncIterator<TransformationExternalData> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * ```js
   * await client.transformationsExternalData.delete([
   *   { externalId: 'snowflake-sales-prod' },
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

  /**
   * ```js
   * const source = await client.transformationsExternalData.byExternalId(
   *   'snowflake-sales-prod'
   * );
   * ```
   */
  public byExternalId = async (
    externalId: CogniteExternalId
  ): Promise<TransformationExternalData> => {
    const response = await this.get<TransformationExternalData>(
      this.url('byExternalId'),
      { params: { externalId } }
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * ```js
   * const keys = await client.transformationsExternalData.rotateKeys([
   *   {
   *     externalId: 'snowflake-sales-prod',
   *     expiryTime: 1692374400000,
   *   },
   * ]);
   * ```
   */
  public rotateKeys = async (
    items: TransformationExternalDataRotateKeysItem[]
  ): Promise<TransformationExternalDataRotatedKey[]> => {
    const response = await this.post<
      ItemsWrapper<TransformationExternalDataRotatedKey[]>
    >(this.url('rotatekeys'), { data: { items } });
    return this.addToMapAndReturn(response.data.items, response);
  };
}
