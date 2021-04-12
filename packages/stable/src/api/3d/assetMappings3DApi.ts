// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator, ListResponse } from '@cognite/sdk-core';
import {
  AssetMapping3D,
  AssetMappings3DFilters,
  AssetMappings3DListFilter,
  CogniteInternalId,
  CreateAssetMapping3D,
  CursorResponse,
  DeleteAssetMapping3D,
} from '../../types';

export class AssetMappings3DAPI extends BaseResourceAPI<AssetMapping3D> {
  /**
   * [List 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/get3DMappings)
   *
   * ```js
   * const mappings3D = await client.assetMappings3D.list(3244265346345, 32423454353545);
   * ```
   */
  public list = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope?: AssetMappings3DListFilter
  ): CursorAndAsyncIterator<AssetMapping3D> => {
    const path = this.encodeUrl(modelId, revisionId);
    return super.listEndpoint(
      params => this.get<CursorResponse<AssetMapping3D[]>>(path, { params }),
      scope
    );
  };

  /**
   * [Create 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/create3DMappings)
   *
   * ```js
   * const assetMappingsToCreate = [
   *  {
   *    nodeId: 8252999965991682,
   *    assetId: 4354399876978078
   *  },
   *  {
   *    nodeId: 9034285498543958,
   *    assetId: 1042345809544395
   *  }
   * ];
   * const mappings3D = await client.assetMappings3D.create(
   *  25432542356436,
   *  33485743958747,
   *  assetMappingsToCreate
   * );
   * ```
   */
  public create = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    items: CreateAssetMapping3D[]
  ): Promise<AssetMapping3D[]> => {
    const path = this.encodeUrl(modelId, revisionId);
    return super.createEndpoint(items, path);
  };

  /**
   * [Delete a list of asset mappings](https://doc.cognitedata.com/api/v1/#operation/delete3DMappings)
   *
   * ```js
   * const assetMappingsToDelete = [
   *  {
   *    nodeId: 8252999965991682,
   *    assetId: 4354399876978078
   *  },
   *  {
   *    nodeId: 9034285498543958,
   *    assetId: 1042345809544395
   *  }
   * ];
   * await client.assetMappings3D.delete(8252999965991682, 4190022127342195, assetMappingsToDelete);
   * ```
   */
  public delete = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    ids: DeleteAssetMapping3D[]
  ): Promise<{}> => {
    const path = this.encodeUrl(modelId, revisionId) + '/delete';
    return super.deleteEndpoint(ids, undefined, path);
  };

  /**
   * [Filter 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/filter3DAssetMappings)
   *
   * ```js
   * const query = {
   *   filter: {
   *     nodeIds: [8252999965991682, 9034285498543958]
   *   },
   *   limit: 5,
   *   cursor: 'loremipsum'
   * };
   * const mappings3D = await client.assetMappings3D.list(3244265346345, 32423454353545, query);
   * ```
   */
   public filter = (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    scope: AssetMappings3DFilters
  ): Promise<ListResponse<AssetMapping3D[]>> => {
    const path = this.encodeUrl(modelId, revisionId) + '/list';
    const res = this.post<ListResponse<AssetMapping3D[]>>(path, { data: scope || {} })
      .then((httpResponse) => { return httpResponse.data; });
    return res;
  };

  private encodeUrl(modelId: CogniteInternalId, revisionId: CogniteInternalId) {
    return this.url(`${modelId}/revisions/${revisionId}/mappings`);
  }
}
