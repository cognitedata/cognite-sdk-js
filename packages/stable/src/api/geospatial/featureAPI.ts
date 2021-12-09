import {
  BaseResourceAPI,
  CogniteExternalId,
  ExternalId,
} from '@cognite/sdk-core';
import {
  Feature,
  FeatureCreateItem,
  FeatureSearchFilter,
  GeometryType,
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
    queryParams?: { outputGeometryFormat: GeometryType }
  ): Promise<Feature[]> => {
    return this.callEndpointWithMergeAndTransform(externalIds, request =>
      this.postInParallelWithAutomaticChunking({
        path: this.url(`${featureTypeExternalId}/features/byids`),
        items: request,
        queryParams,
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
    externalIds: ExternalId[]
  ) => {
    return this.deleteEndpoint(
      externalIds,
      {},
      this.url(`${featureTypeExternalId}/features/delete`)
    );
  };

  public search = (
    featureTypeExternalId: CogniteExternalId,
    query: FeatureSearchFilter,
    queryParams?: { outputGeometryFormat: GeometryType }
  ): Promise<Feature[]> => {
    return this.searchEndpoint(
      query,
      this.url(`${featureTypeExternalId}/features/search`),
      queryParams
    );
  };
}
