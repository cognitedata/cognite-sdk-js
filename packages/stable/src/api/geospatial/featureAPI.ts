import {
  BaseResourceAPI,
  CogniteExternalId,
  ExternalId,
} from '@cognite/sdk-core';
import {
  Feature,
  FeatureAggregateParams,
  FeatureCreateItem,
  FeatureOutputParams,
  FeatureSearchFilter,
  FeatureSearchStreamFilter,
} from './types';

export class FeatureAPI extends BaseResourceAPI<Feature> {
  public create = (
    featureTypeExternalId: CogniteExternalId,
    features: FeatureCreateItem[]
  ): Promise<Feature[]> => {
    return this.createEndpoint<FeatureCreateItem>(
      features,
      this.url(`${featureTypeExternalId}/features`)
    );
  };

  public retrieve = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
    params?: FeatureOutputParams
  ): Promise<Feature[]> => {
    return this.callEndpointWithMergeAndTransform(externalIds, request =>
      this.postInParallelWithAutomaticChunking({
        path: this.url(`${featureTypeExternalId}/features/byids`),
        items: request,
        params,
      })
    );
  };

  public update = (
    featureTypeExternalId: CogniteExternalId,
    changes: FeatureCreateItem[]
  ): Promise<Feature[]> => {
    return this.updateEndpoint(
      changes,
      this.url(`${featureTypeExternalId}/features/update`)
    );
  };

  public delete = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
    params: FeatureOutputParams = {}
  ) => {
    return this.deleteEndpoint(
      externalIds,
      params,
      this.url(`${featureTypeExternalId}/features/delete`)
    );
  };

  public search = (
    featureTypeExternalId: CogniteExternalId,
    params: FeatureSearchFilter = {}
  ): Promise<Feature[]> => {
    return this.searchEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/search`)
    );
  };

  public searchStream = (
    featureTypeExternalId: CogniteExternalId,
    params: FeatureSearchStreamFilter = {}
  ): Promise<Feature[]> => {
    return this.searchEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/search-streaming`)
    );
  };

  public aggregate = (
    featureTypeExternalId: CogniteExternalId,
    params?: FeatureAggregateParams
  ) => {
    return this.aggregateEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/aggregate`)
    );
  };
}
