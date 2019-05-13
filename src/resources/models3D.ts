// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  CreateModel3D,
  InternalId,
  Model3D,
  Model3DListRequest,
  UpdateModel3D,
} from '../types/types';
import { projectUrl } from '../utils';

export interface Models3DAPI {
  /**
   * [List 3D models](https://doc.cognitedata.com/api/v1/#operation/get3DModels)
   *
   * ```js
   * const models3D = await client.models3D.list({ published: true });
   * ```
   */
  list: (scope?: Model3DListRequest) => CogniteAsyncIterator<Model3D>;
  /**
   * [Create 3D models](https://doc.cognitedata.com/api/v1/#operation/create3DModels)
   *
   * ```js
   * const modelsToCreate = [
   *   { name: 'Model 0' },
   *   { name: 'Model 2' },
   * ];
   * const models3D = await client.models3D.create(modelsToCreate);
   * ```
   */
  create: (models: CreateModel3D[]) => Promise<Model3D[]>;
  /**
   * [Update 3D models](https://doc.cognitedata.com/api/v1/#operation/update3DModels)
   *
   * ```js
   * const modelsToUpdate = [
   *   { id: 3744350296805509, update: { name: { set: 'Model 0 updated' }}},
   *   { id: 8163365893677939, update: { name: { set: 'Model 2 updated' }}},
   * ];
   * const models3D = await client.models3D.update(modelsToUpdate);
   * ```
   */
  update: (items: UpdateModel3D[]) => Promise<Model3D[]>;
  /**
   * [Delete 3D models](https://doc.cognitedata.com/api/v1/#operation/delete3DModels)
   *
   * ```js
   * await client.models3D.delete([{ id: 3744350296805509 }, { id: 8163365893677939 }]);
   * ```
   */
  delete: (ids: InternalId[]) => Promise<{}>;
  /**
   * [Retrieve a 3D model](https://doc.cognitedata.com/api/v1/#operation/get3DModel)
   *
   * ```js
   * await client.models3D.retrieve(3744350296805509);
   * ```
   */
  retrieve: (id: CogniteInternalId) => Promise<Model3D>;
}

/** @hidden */
export function generateModels3DObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): Models3DAPI {
  const path = projectUrl(project) + '/3d/models';
  return {
    list: generateListEndpoint(instance, path, map, false),
    create: generateCreateEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
    retrieve: generateRetrieveSingleEndpoint(instance, path, map),
  };
}
