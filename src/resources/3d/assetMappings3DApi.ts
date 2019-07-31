// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
} from '../../standardMethods';
import {
  AssetMapping3D,
  AssetMappings3DListFilter,
  CogniteInternalId,
  CreateAssetMapping3D,
  DeleteAssetMapping3D,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class AssetMappings3DAPI {
  private project: string;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    this.project = project;
    this.instance = instance;
    this.map = map;
  }

  /**
   * [List 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/get3DMappings)
   *
   * ```js
   * const mappings3D = await client.assetMappings3D.list();
   * ```
   */
  public list: AssetMappings3DListEndpoint = (modelId, revisionId, filter) => {
    return generateListEndpoint<
      AssetMappings3DListFilter,
      AssetMapping3D,
      AssetMapping3D
    >(
      this.instance,
      parameterizePath(this.project, modelId, revisionId),
      this.map,
      false,
      items => items
    )(filter);
  };

  /**
   * [Create 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/create3DMappings)
   *
   * ```js
   * const assetMappingsToCreate = [
   *  {
   *    nodeId: 8252999965991682
   *    assetId: 4354399876978078
   *  },
   *  {
   *    nodeId: 9034285498543958
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
  public create: AssetMappings3DCreateEndpoint = (
    modelId,
    revisionId,
    items
  ) => {
    return generateCreateEndpoint<
      CreateAssetMapping3D,
      AssetMapping3D,
      AssetMapping3D[]
    >(
      this.instance,
      parameterizePath(this.project, modelId, revisionId),
      this.map,
      item => item
    )(items);
  };

  /**
   * [Delete a list of asset mappings](https://doc.cognitedata.com/api/v1/#operation/delete3DMappings)
   *
   * ```js
   * const assetMappingsToDelete = [
   *  {
   *    nodeId: 8252999965991682
   *    assetId: 4354399876978078
   *  },
   *  {
   *    nodeId: 9034285498543958
   *    assetId: 1042345809544395
   *  }
   * ];
   * await client.assetMappings3D.delete(8252999965991682, 4190022127342195, assetMappingsToDelete);
   * ```
   */
  public delete: AssetMappings3DDeleteEndpoint = (
    modelId,
    revisionId,
    items
  ) => {
    return generateDeleteEndpoint(
      this.instance,
      parameterizePath(this.project, modelId, revisionId),
      this.map
    )(items);
  };
}

export type AssetMappings3DListEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  filter?: AssetMappings3DListFilter
) => CursorAndAsyncIterator<AssetMapping3D>;

export type AssetMappings3DCreateEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  items: CreateAssetMapping3D[]
) => Promise<AssetMapping3D[]>;

export type AssetMappings3DDeleteEndpoint = (
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId,
  ids: DeleteAssetMapping3D[]
) => Promise<{}>;

function parameterizePath(
  project: string,
  modelId: CogniteInternalId,
  revisionId: CogniteInternalId
) {
  return `${projectUrl(
    project
  )}/3d/models/${modelId}/revisions/${revisionId}/mappings`;
}
