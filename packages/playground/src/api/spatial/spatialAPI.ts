import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';

import { FeaturesAPI } from './featuresAPI';
import { FeatureTypesAPI } from './featureTypesAPI';
import { Spatial } from './types';

export class SpatialAPI extends BaseResourceAPI<Spatial> {
  private readonly featureTypesAPI: FeatureTypesAPI;
  private readonly featuresAPI: FeaturesAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [, httpClient, map] = args;

    this.featureTypesAPI = new FeatureTypesAPI(
      this.url('featuretypes'),
      httpClient,
      map
    );

    this.featuresAPI = new FeaturesAPI(
      this.url('featuretypes'),
      httpClient,
      map
    );
  }

  public get features() {
    return this.featuresAPI;
  }

  public get featureTypes() {
    return this.featureTypesAPI;
  }
}
