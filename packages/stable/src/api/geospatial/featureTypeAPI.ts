import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
} from '@cognite/sdk-core';
import { FeatureType, FeatureTypeCreateItem, FeatureTypePatch } from './types';

export class FeatureTypeAPI extends BaseResourceAPI<FeatureType> {
  public create = (
    featureTypes: FeatureTypeCreateItem[]
  ): Promise<FeatureType[]> => {
    return this.createEndpoint<FeatureTypeCreateItem>(featureTypes);
  };

  public retrieve = (externalIds: ExternalId[]): Promise<FeatureType[]> => {
    return this.retrieveEndpoint(externalIds);
  };

  public list = (): CursorAndAsyncIterator<FeatureType> => {
    return this.listEndpoint(this.callListEndpointWithPost);
  };

  public delete = (externalIds: ExternalId[]) => {
    return this.deleteEndpoint(externalIds);
  };

  public update = (changes: FeatureTypePatch[]) => {
    return this.updateEndpoint<FeatureTypePatch>(changes);
  };
}
