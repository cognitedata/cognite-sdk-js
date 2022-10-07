import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';

import { CrsAPI } from './crsAPI';
import { FeatureAPI } from './featureAPI';
import { FeatureTypeAPI } from './featureTypeAPI';
import { Geospatial } from './types';

export class GeospatialAPI extends BaseResourceAPI<Geospatial> {
  private readonly crsAPI: CrsAPI;
  private readonly featureTypeAPI: FeatureTypeAPI;
  private readonly featureAPI: FeatureAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [, httpClient, map] = args;

    this.crsAPI = new CrsAPI(this.url('crs'), httpClient, map);

    this.featureTypeAPI = new FeatureTypeAPI(
      this.url('featuretypes'),
      httpClient,
      map
    );

    this.featureAPI = new FeatureAPI(this.url('featuretypes'), httpClient, map);
  }

  public get crs() {
    return this.crsAPI;
  }

  public get feature() {
    return this.featureAPI;
  }

  public get featureType() {
    return this.featureTypeAPI;
  }
}
