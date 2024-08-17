import {
  BaseResourceAPI,
  type CogniteExternalId,
  type ExternalId,
} from '@cognite/sdk-core';
import type {
  FeatureAggregateParams,
  GeospatialFeature,
  GeospatialFeatureListFilter,
  GeospatialFeatureResponse,
  GeospatialFeatureSearchFilter,
  GeospatialFeatureSearchStreamFilter,
  GeospatialFeatureSearchStreamResponse,
  GeospatialOutput,
} from './types';

export class FeatureAPI extends BaseResourceAPI<GeospatialFeatureResponse> {
  /**
   * [Create features](https://docs.cognite.com/api/v1/#operation/createFeatures)
   *
   * ```js
   * const featureTypeExternalId = 'ocean_temperature';
   * const features = [
   *   { externalId: 'measurement_point_765', temperature: 5.65, location: { wkt: 'POINT(60.547602 -5.423433)' }},
   *   { externalId: 'measurement_point_863', temperature: 5.03, location: { wkt: 'POINT(60.585858 -6.474416)' }},
   * ];
   * const createdFeatures = await client.geospatial.feature.create(featureTypeExternalId, features);
   * ```
   */
  public create = (
    featureTypeExternalId: CogniteExternalId,
    features: GeospatialFeature[],
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.createEndpoint<GeospatialFeature>(
      features,
      this.url(`${featureTypeExternalId}/features`),
    );
  };

  /**
   * [Retrieve features](https://docs.cognite.com/api/v1/#operation/getFeaturesByIds)
   *
   * ```js
   * const featuresToRetrieve = [{ externalId: 'measurement_point_765' }, { externalId: 'measurement_point_765' }];
   * const outputParams = { output: { geometryFormat: 'GEOJSON' as const } };
   *
   * const retrievedFeatures = await client.geospatial.feature.retrieve('ocean_temperature', featuresToRetrieve, outputParams);
   * ```
   */
  public retrieve = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
    params?: GeospatialOutput,
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.callEndpointWithMergeAndTransform(externalIds, (request) =>
      this.postInParallelWithAutomaticChunking({
        path: this.url(`${featureTypeExternalId}/features/byids`),
        items: request,
        params,
      }),
    );
  };

  /**
   * [Update features](https://docs.cognite.com/api/v1/#operation/updateFeatures)
   *
   * ```js
   * const featuresToUpdate = [
   * { externalId: 'measurement_point_765', temperature: 5.65, location: { wkt: 'POINT(60.547602 -5.423433)' } },
   * { externalId: 'measurement_point_863', temperature: 5.03, location: { wkt: 'POINT(60.585858 -6.474416)' } }
   * ];
   *
   * const updatedFeatures = await client.geospatial.feature.update('ocean_temperature', featuresToUpdate);
   * ```
   */
  public update = (
    featureTypeExternalId: CogniteExternalId,
    changes: GeospatialFeature[],
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.updateEndpoint(
      changes,
      this.url(`${featureTypeExternalId}/features/update`),
    );
  };

  /**
   * [Update features](https://docs.cognite.com/api/v1/#operation/updateFeatures)
   *
   * ```js
   * const featuresToDelete = [{ externalId: 'measurement_point_765' }, { externalId: 'measurement_point_765' }];
   *
   * await client.geospatial.feature.delete('ocean_temperature', featuresToDelete);
   * ```
   */
  public delete = (
    featureTypeExternalId: CogniteExternalId,
    externalIds: ExternalId[],
  ) => {
    return this.deleteEndpoint(
      externalIds,
      {},
      this.url(`${featureTypeExternalId}/features/delete`),
    );
  };

  /**
   * [Search features](https://docs.cognite.com/api/v1/#operation/searchFeatures)
   *
   * ```js
   * const params = {
   *  filter: {
   *    and: [
   *      { range:{ property: 'temperature', gt:4.54 } },
   *      { stWithin: { property:'location', value:'POLYGON((60.547602 -5.423433, 60.547602 -6.474416, 60.585858 -5.423433, 60.547602 -5.423433))' } }
   *   ]
   *  },
   *  limit: 100,
   *  sort: [ 'temperature:ASC','location']
   * };
   *
   * const searchedFeatures = await client.geospatial.feature.search('ocean_temperature', params);
   * ```
   */
  public search = (
    featureTypeExternalId: CogniteExternalId,
    params: GeospatialFeatureSearchFilter = {},
  ): Promise<GeospatialFeatureResponse[]> => {
    return this.searchEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/search`),
    );
  };

  /**
   * [Search and stream features](https://docs.cognite.com/api/v1/#operation/searchFeaturesStreaming)
   *
   * ```js
   * const params = {
   *  filter: {
   *    and: [
   *      { range:{ property: 'temperature', gt:4.54 } },
   *      { stWithin: { property:'location', value:'POLYGON((60.547602 -5.423433, 60.547602 -6.474416, 60.585858 -5.423433, 60.547602 -5.423433))' } }
   *   ]
   *  },
   *  limit: 100,
   *  output: { jsonStreamFormat: 'NEW_LINE_DELIMITED' as const }
   * };
   *
   * const featureStreamString = await client.geospatial.feature.searchStream('ocean_temperature', params);
   * ```
   */
  public searchStream = (
    featureTypeExternalId: CogniteExternalId,
    params: GeospatialFeatureSearchStreamFilter = {},
  ): Promise<GeospatialFeatureSearchStreamResponse> => {
    return this.callSearchEndpoint<
      GeospatialFeatureSearchStreamFilter,
      GeospatialFeatureSearchStreamResponse
    >(
      params,
      this.url(`${featureTypeExternalId}/features/search-streaming`),
      // not using addToMapAndReturn in then as WeakMap does not accept primitive values as key and we've string as our response
    ).then((response) => response.data);
  };

  /**
   * [Aggregate features](https://docs.cognite.com/api/v1/#operation/aggregateFeatures)
   *
   * ```js
   * const aggregateParams = {
   *  filter: {
   *    and: [
   *      { range:{ property: 'temperature', gt:4.54 } },
   *      { stWithin: { property:'location', value:'POLYGON((60.547602 -5.423433, 60.547602 -6.474416, 60.585858 -5.423433, 60.547602 -5.423433))' } }
   *   ]
   *  },
   *  property: 'temperature',
   *  aggregates: ['min', 'max', 'average'],
   *  groupBy: ['category']
   * };
   *
   * const featureStream = await client.geospatial.feature.searchStream('ocean_temperature', aggregateParams);
   * ```
   */
  public aggregate = (
    featureTypeExternalId: CogniteExternalId,
    params?: FeatureAggregateParams,
  ) => {
    return this.aggregateEndpoint(
      params,
      this.url(`${featureTypeExternalId}/features/aggregate`),
    );
  };

  /**
   * [List features](https://docs.cognite.com/api/v1/#tag/Geospatial/operation/listFeatures)
   *
   * ```js
   * const params = {
   *  filter: {
   *    and: [
   *      { range:{ property: 'temperature', gt:4.54 } },
   *      { stWithin: { property:'location', value:'POLYGON((60.547602 -5.423433, 60.547602 -6.474416, 60.585858 -5.423433, 60.547602 -5.423433))' } }
   *   ]
   *  },
   * };
   *
   * const allFeaturesList = await client.geospatial.feature.list('ocean_temperature', params);
   * ```
   */
  public list = (
    featureTypeExternalId: CogniteExternalId,
    filterParams: GeospatialFeatureListFilter = {},
  ) => {
    const path = this.url(`${featureTypeExternalId}/features/list`);
    return this.listEndpoint(
      async (params) => this.post(path, { data: params }),
      filterParams,
    );
  };
}
