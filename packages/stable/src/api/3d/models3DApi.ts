// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  CreateModel3D,
  InternalId,
  Model3D,
  Model3DListRequest,
  UpdateModel3D,
} from '../../types';

/**
 * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class Models3DAPI extends BaseResourceAPI<Model3D> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

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
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public create = (models: CreateModel3D[]): Promise<Model3D[]> => {
    return super.createEndpoint(models);
  };

  /**
   * [List 3D models](https://doc.cognitedata.com/api/v1/#operation/get3DModels)
   *
   * ```js
   * const models3D = await client.models3D.list({ published: true });
   * ```
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public list = (
    scope?: Model3DListRequest
  ): CursorAndAsyncIterator<Model3D> => {
    return super.listEndpoint(this.callListEndpointWithGet, scope);
  };

  /**
   * [Retrieve a 3D model](https://doc.cognitedata.com/api/v1/#operation/get3DModel)
   *
   * ```js
   * await client.models3D.retrieve(3744350296805509);
   * ```
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public retrieve = async (id: CogniteInternalId): Promise<Model3D> => {
    const path = this.url(`${id}`);
    const response = await this.get<Model3D>(path);
    return this.addToMapAndReturn(response.data, response);
  };

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
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public update = (changes: UpdateModel3D[]): Promise<Model3D[]> => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Delete 3D models](https://doc.cognitedata.com/api/v1/#operation/delete3DModels)
   *
   * ```js
   * await client.models3D.delete([{ id: 3744350296805509 }, { id: 8163365893677939 }]);
   * ```
   *
   * @deprecated Classic 3D API, deprecated 2026-10-15; no retirement date is announced. 3D models are managed through data modeling going forward. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
   */
  public delete = (ids: InternalId[]) => {
    return super.deleteEndpoint(ids);
  };
}
