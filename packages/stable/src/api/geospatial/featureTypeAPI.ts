import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
} from '@cognite/sdk-core';
import {
  FeatureType,
  GeospatialCreateFeatureType,
  GeospatialUpdateFeatureType,
  GeospatialRecursiveDelete,
} from './types';

export class FeatureTypeAPI extends BaseResourceAPI<FeatureType> {
  public create = (
    featureTypes: GeospatialCreateFeatureType[]
  ): Promise<FeatureType[]> => {
    return this.createEndpoint<GeospatialCreateFeatureType>(featureTypes);
  };

  public retrieve = (externalIds: ExternalId[]): Promise<FeatureType[]> => {
    return this.retrieveEndpoint(externalIds);
  };

  public list = (): CursorAndAsyncIterator<FeatureType> => {
    return this.listEndpoint(this.callListEndpointWithPost);
  };

  public delete = (
    externalIds: ExternalId[],
    params: GeospatialRecursiveDelete = {}
  ) => {
    return this.deleteEndpoint(externalIds, params);
  };

  public update = (changes: GeospatialUpdateFeatureType[]) => {
    return this.updateEndpoint<GeospatialUpdateFeatureType>(changes);
  };
}
