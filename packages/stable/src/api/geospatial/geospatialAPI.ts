import {
  BaseResourceAPI,
  type CDFHttpClient,
  type MetadataMap,
} from '@cognite/sdk-core';

import { ComputeAPI } from './computeAPI';
import { CrsAPI } from './crsAPI';
import { FeatureAPI } from './featureAPI';
import { FeatureTypeAPI } from './featureTypeAPI';
import type { Geospatial } from './types';

/**
 * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class GeospatialAPI extends BaseResourceAPI<Geospatial> {
  private readonly computeAPI: ComputeAPI;
  private readonly crsAPI: CrsAPI;
  private readonly featureTypeAPI: FeatureTypeAPI;
  private readonly featureAPI: FeatureAPI;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [, httpClient, map] = args;

    this.computeAPI = new ComputeAPI(this.url('compute'), httpClient, map);
    this.crsAPI = new CrsAPI(this.url('crs'), httpClient, map);

    this.featureTypeAPI = new FeatureTypeAPI(
      this.url('featuretypes'),
      httpClient,
      map
    );

    this.featureAPI = new FeatureAPI(this.url('featuretypes'), httpClient, map);
  }

  public get compute() {
    return this.computeAPI;
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
