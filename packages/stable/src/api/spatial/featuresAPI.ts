import {
  BaseResourceAPI,
  CogniteExternalId,
  IdEither,
  ExternalId,
} from '@cognite/sdk-core';
import { Features, FeaturesCreateItem, FeatureSearchFilter } from './types';

export class FeaturesAPI extends BaseResourceAPI<Features> {
  public create = (
    featureTypeExternalId: CogniteExternalId,
    features: FeaturesCreateItem[]
  ): Promise<Features[]> => {
    return this.createEndpoint<FeaturesCreateItem>(
      features,
      this.url(`${featureTypeExternalId}/features`)
    );
  };

  public retrieve = (
    featureTypeExternalId: CogniteExternalId,
    ids: IdEither[],
    queryParams?: { outputGeometryFormat: 'wkt' | 'geojson' }
  ): Promise<Features[]> => {
    return this.callEndpointWithMergeAndTransform(ids, request =>
      this.postInParallelWithAutomaticChunking({
        path: this.url(`${featureTypeExternalId}/features/byids`),
        items: request,
        queryParams,
      })
    );
  };

  public update = (
    featureTypeExternalId: CogniteExternalId,
    changes: FeaturesCreateItem[]
  ): Promise<Features[]> => {
    return this.updateEndpoint(
      changes,
      this.url(`${featureTypeExternalId}/features/update`)
    );
  };

  public delete = (
    featureTypeExternalId: CogniteExternalId,
    ids: ExternalId[]
  ) => {
    return this.deleteEndpoint(
      ids,
      {},
      this.url(`${featureTypeExternalId}/features/delete`)
    );
  };

  public search = (
    featureTypeExternalId: CogniteExternalId,
    query: FeatureSearchFilter,
    queryParams?: { outputGeometryFormat: 'wkt' | 'geojson' }
  ): Promise<Features[]> => {
    return this.searchEndpoint(
      query,
      this.url(`${featureTypeExternalId}/features/search`),
      queryParams
    );
  };
}
