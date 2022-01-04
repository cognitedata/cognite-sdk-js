import {
  BaseResourceAPI,
  CogniteExternalId,
  ExternalId,
} from '@cognite/sdk-core';
import {
  GeospatialFeatureResponse,
  FeatureAggregateParams,
  GeospatialFeature,
  GeospatialOutput,
  GeospatialFeatureSearchFilter,
  GeospatialFeatureSearchStreamFilter,
} from './types';

export class FeatureAPI extends BaseResourceAPI<GeospatialFeatureResponse> {
  public create = (
    featureTypeExternalId: CogniteExternalId,
    features: GeospatialFeature[]
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.createEndpoint<GeospatialFeature>(
      features,
      this.url(`${featureTypeExternalId}/features`)
    );
  };

  public retrieve = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
    params?: GeospatialOutput
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.callEndpointWithMergeAndTransform(externalIds, (request) =>
      this.postInParallelWithAutomaticChunking({
        path: this.url(`${featureTypeExternalId}/features/byids`),
        items: request,
        params,
      })
    );
  };

  public update = (
    featureTypeExternalId: CogniteExternalId,
    changes: GeospatialFeature[]
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.updateEndpoint(
      changes,
      this.url(`${featureTypeExternalId}/features/update`)
    );
  };

  public delete = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
    params: GeospatialOutput = {}
  ) => {
    return this.deleteEndpoint(
      externalIds,
      params,
      this.url(`${featureTypeExternalId}/features/delete`)
    );
  };

  public search = (
    featureTypeExternalId: CogniteExternalId,
    params: GeospatialFeatureSearchFilter = {}
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.searchEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/search`)
    );
  };

  public searchStream = (
    featureTypeExternalId: CogniteExternalId,
    params: GeospatialFeatureSearchStreamFilter = {}
  ): Promise<GeospatialFeatureResponse[]> => {
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
