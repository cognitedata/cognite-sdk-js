import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
  IdEither,
} from '@cognite/sdk-core';
import { FeatureTypes, FeatureTypesCreateItem } from './types';

export class FeatureTypesAPI extends BaseResourceAPI<FeatureTypes> {
  public create = (
    featureTypes: FeatureTypesCreateItem[]
  ): Promise<FeatureTypes[]> => {
    return this.createEndpoint<FeatureTypesCreateItem>(featureTypes);
  };

  public retrieve = (ids: IdEither[]): Promise<FeatureTypes[]> => {
    return this.retrieveEndpoint(ids);
  };

  public list = (): CursorAndAsyncIterator<FeatureTypes> => {
    return this.listEndpoint(this.callListEndpointWithPost);
  };

  public delete = (ids: ExternalId[]) => {
    return this.deleteEndpoint(ids);
  };
}
