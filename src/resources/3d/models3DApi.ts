// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveSingleEndpoint,
  generateUpdateEndpoint,
} from '../../standardMethods';
import {
  CogniteInternalId,
  CreateModel3D,
  InternalId,
  Model3D,
  Model3DListRequest,
  UpdateModel3D,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class Models3DAPI {
  /**
   * [List 3D models](https://doc.cognitedata.com/api/v1/#operation/get3DModels)
   *
   * ```js
   * const models3D = await client.models3D.list({ published: true });
   * ```
   */
  public list: Models3DListEndpoint;

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
  public create: Models3DCreateEndpoint;

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
  public update: Models3DUpdateEndpoint;

  /**
   * [Delete 3D models](https://doc.cognitedata.com/api/v1/#operation/delete3DModels)
   *
   * ```js
   * await client.models3D.delete([{ id: 3744350296805509 }, { id: 8163365893677939 }]);
   * ```
   */
  public delete: Models3DDeleteEndpoint;

  /**
   * [Retrieve a 3D model](https://doc.cognitedata.com/api/v1/#operation/get3DModel)
   *
   * ```js
   * await client.models3D.retrieve(3744350296805509);
   * ```
   */
  public retrieve: Models3DRetrieveEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/3d/models';
    this.list = generateListEndpoint<Model3DListRequest, Model3D>(
      instance,
      path,
      map,
      false
    );
    this.create = generateCreateEndpoint<CreateModel3D, Model3D>(
      instance,
      path,
      map
    );
    this.update = generateUpdateEndpoint<UpdateModel3D, Model3D>(
      instance,
      path,
      map
    );
    this.delete = generateDeleteEndpoint(instance, path, map);
    this.retrieve = generateRetrieveSingleEndpoint(instance, path, map);
  }
}

export type Models3DListEndpoint = (
  scope?: Model3DListRequest
) => CursorAndAsyncIterator<Model3D>;

export type Models3DCreateEndpoint = (
  models: CreateModel3D[]
) => Promise<Model3D[]>;

export type Models3DUpdateEndpoint = (
  items: UpdateModel3D[]
) => Promise<Model3D[]>;

export type Models3DDeleteEndpoint = (ids: InternalId[]) => Promise<{}>;

export type Models3DRetrieveEndpoint = (
  id: CogniteInternalId
) => Promise<Model3D>;
