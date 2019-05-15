// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
} from '../standardMethods';
import {
  AssetMapping3D,
  AssetMappings3DListFilter,
  CogniteInternalId,
  CreateAssetMapping3D,
  DeleteAssetMapping3D,
} from '../types/types';
import { projectUrl } from '../utils';

export interface AssetMappings3DAPI {
  /**
   * [List 3D asset mappings](https://doc.cognitedata.com/api/v1/#operation/get3DMappings)
   *
   * ```js
   * const mappings3D = await client.assetMappings3D.list();
   * ```
   */
  list: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    filter?: AssetMappings3DListFilter
  ) => CogniteAsyncIterator<AssetMapping3D>;
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
  create: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    items: CreateAssetMapping3D[]
  ) => Promise<AssetMapping3D[]>;
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
  delete: (
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId,
    ids: DeleteAssetMapping3D[]
  ) => Promise<{}>;
}

/** @hidden */
export function generateAssetMappings3DObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): AssetMappings3DAPI {
  function parameterizePath(
    modelId: CogniteInternalId,
    revisionId: CogniteInternalId
  ) {
    return `${projectUrl(
      project
    )}/3d/models/${modelId}/revisions/${revisionId}/mappings`;
  }

  return {
    list: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      filter?: AssetMappings3DListFilter
    ) => {
      return generateListEndpoint<AssetMappings3DListFilter, AssetMapping3D>(
        instance,
        parameterizePath(modelId, revisionId),
        map,
        false
      )(filter);
    },
    create: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      items: CreateAssetMapping3D[]
    ) => {
      return generateCreateEndpoint<CreateAssetMapping3D, AssetMapping3D>(
        instance,
        parameterizePath(modelId, revisionId),
        map
      )(items);
    },
    delete: (
      modelId: CogniteInternalId,
      revisionId: CogniteInternalId,
      items: DeleteAssetMapping3D[]
    ) => {
      return generateDeleteEndpoint(
        instance,
        parameterizePath(modelId, revisionId),
        map
      )(items);
    },
  };
}
