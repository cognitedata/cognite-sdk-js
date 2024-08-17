import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
  type ExternalId,
} from '@cognite/sdk-core';
import type {
  FeatureType,
  GeospatialCreateFeatureType,
  GeospatialRecursiveDelete,
  GeospatialUpdateFeatureType,
} from './types';

export class FeatureTypeAPI extends BaseResourceAPI<FeatureType> {
  /**
   * [Create feature types](https://docs.cognite.com/api/v1/#operation/createFeatureTypes)
   *
   * ```js
   * const featureTypes = [
   *   {
   *      externalId: 'ocean_temperature',
   *      properties: { temperature: { type: 'DOUBLE' as const }, location: { type: 'POINT' as const, srid: 4326 } } ,
   *      searchSpec: { location_idx: { properties : ['location'] } }
   *   }
   * ];
   * const createdFeatureTypes = await client.geospatial.featureType.create(featureTypes);
   * ```
   */
  public create = (
    featureTypes: GeospatialCreateFeatureType[],
  ): Promise<FeatureType[]> => {
    return this.createEndpoint<GeospatialCreateFeatureType>(featureTypes);
  };

  /**
   * [Retrieve feature types](https://docs.cognite.com/api/v1/#operation/getFeatureTypesByIds)
   *
   * ```js
   * const retrievedFeatureTypes = await client.geospatial.featureType.retrieve([ { externalId: 'ocean_temperature' } ]);
   * ```
   */
  public retrieve = (externalIds: ExternalId[]): Promise<FeatureType[]> => {
    return this.retrieveEndpoint(externalIds);
  };

  /**
   * [List feature types](https://docs.cognite.com/api/v1/#operation/listFeatureTypes)
   *
   * ```js
   * const allFeatureTypes = await client.geospatial.featureType.list();
   * ```
   */
  public list = (): CursorAndAsyncIterator<FeatureType> => {
    return this.listEndpoint(this.callListEndpointWithPost);
  };

  /**
   * [Delete feature types](https://docs.cognite.com/api/v1/#operation/GeospatialDeleteFeatureTypes)
   *
   * ```js
   * await client.geospatial.featureType.delete([{ externalId: 'ocean_temperature'}], { recursive : true });
   * ```
   */
  public delete = (
    externalIds: ExternalId[],
    params: GeospatialRecursiveDelete = {},
  ) => {
    return this.deleteEndpoint(externalIds, params);
  };

  /**
   * [Update feature types](https://docs.cognite.com/api/v1/#operation/updateFeatureTypes)
   *
   * ```js
   * const featureTypesToUpdate = [
   *  {
   *    externalId: 'ocean_temperature',
   *    update: {
   *        properties: { add: { depth: { type: 'DOUBLE'} }, remove: ['temperature'] },
   *        searchSpec: { add: { depth_idx: { properties: ['depth'] } } }
   *    }
   *  }
   * ];
   * const updatedFeatureTypes = await client.geospatial.featureType.update(featureTypesToUpdate);
   * ```
   */
  public update = (changes: GeospatialUpdateFeatureType[]) => {
    return this.updateEndpoint<GeospatialUpdateFeatureType>(changes);
  };
}
