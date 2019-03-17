// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  // CreateEndpoint,
  generateCreateEndpoint,
  // generateDeleteEndpoint,
  generateListEndpoint,
  // generateRetrieveEndpoint,
  // generateRetrieveMultipleEndpoint,
  // generateSearchEndpoint,
  // generateUpdateEndpoint,
} from '../StandardMethods';
import {
  // AddField,
  Asset,
  CreateAsset,
  // CreateType,
  // Field,
  ListAssetsParams,
  // ListTypesParams,
  // SearchAssetsParams,
  // Type,
  // UpdateAsset,
  // UpdateField,
  // UpdateType,
} from '../types/cdpTypes';
import { projectUrl } from '../utils';

export interface AssetAPI {
  /**
   * [Creates new assets](https://doc.cognitedata.com/api/0.6/#operation/postAssets)
   *
   * ```js
   * const assets = [
   *   { name: 'First asset' },
   *   { name: 'Second asset', description: 'Child asset' },
   * ];
   * const createdAssets = await client.assets.create(assets);
   * ```
   */
  create: (items: CreateAsset[]) => Promise<Asset[]>;

  /**
   * [List assets](https://doc.cognitedata.com/api/0.6/#operation/getAssets)
   *
   * ```js
   * const response = await client.assets.list({ depth: 0 });
   * ```
   */
  list: (params?: ListAssetsParams) => CogniteAsyncIterator<Asset>;
}

/** @hidden */
export function generateAssetsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): AssetAPI {
  const assetsPath = projectUrl(project) + '/assets';
  // const typesPath = projectUrl(project) + '/assets/types';
  // const generateFieldPath = (typeId: number) =>
  //   projectUrl(project) + `/assets/types/${typeId}/fields`;

  return {
    // assets
    create: generateCreateEndpoint(instance, assetsPath, map),
    list: generateListEndpoint<ListAssetsParams, Asset>(
      instance,
      assetsPath,
      map
    ),
    // search: generateSearchEndpoint<SearchAssetsParams, Asset>(
    //   instance,
    //   assetsPath,
    //   map
    // ),
    // update: generateUpdateEndpoint<UpdateAsset, Asset>(
    //   instance,
    //   assetsPath,
    //   map
    // ),
    // retrieve: generateRetrieveEndpoint<Asset>(instance, assetsPath, map),
    // retrieveMultiple: generateRetrieveMultipleEndpoint<Asset>(
    //   instance,
    //   assetsPath,
    //   map
    // ),
    // delete: generateDeleteEndpoint(instance, assetsPath, map),

    // types
    // createTypes: generateCreateEndpoint<CreateType, Type>(
    //   instance,
    //   typesPath,
    //   map
    // ),
    // listTypes: generateListEndpoint<ListTypesParams, Type>(
    //   instance,
    //   typesPath,
    //   map
    // ),
    // deleteTypes: generateDeleteEndpoint(instance, typesPath, map),
    // retrieveType: generateRetrieveEndpoint<Type>(instance, typesPath, map),
    // retrieveMultipleTypes: generateRetrieveMultipleEndpoint<Type>(
    //   instance,
    //   typesPath,
    //   map
    // ),
    // updateTypes: generateUpdateEndpoint<UpdateType, Type>(
    //   instance,
    //   typesPath,
    //   map
    // ),

    // fields
    // addFields: (typeId: number, items: AddField[]) => {
    //   const fieldsPath = generateFieldPath(typeId);
    //   const endpoint = generateCreateEndpoint<AddField, Field>(
    //     instance,
    //     fieldsPath,
    //     map
    //   );
    //   return endpoint(items);
    // },
    // removeFields: (typeId: number, fieldIds: number[]) => {
    //   const fieldsPath = generateFieldPath(typeId);
    //   const endpoint = generateDeleteEndpoint(instance, fieldsPath, map);
    //   return endpoint(fieldIds);
    // },
    // updateFields: (typeId: number, changes: UpdateField[]) => {
    //   const fieldsPath = generateFieldPath(typeId);
    //   const endpoint = generateUpdateEndpoint<UpdateField, Field>(
    //     instance,
    //     fieldsPath,
    //     map
    //   );
    //   return endpoint(changes);
    // },
  };
}
