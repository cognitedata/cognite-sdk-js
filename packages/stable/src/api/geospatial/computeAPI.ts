import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  GeospatialComputedItemList,
  GeospatialJsonComputeOutput,
} from './types';

/**
 * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class ComputeAPI extends BaseResourceAPI<GeospatialComputedItemList> {
  /**
   * [Compute custom json output structures or well known binary format responses based on calculation or selection of feature properties or direct values given in the request.](https://docs.cognite.com/api/v1/#operation/compute)
   *
   * ```js
   *
   * const response = await client.geospatial.compute.compute({
   *   output: {
   *     "output": {
   *       stTransform: {
   *         geometry: {
   *           ewkt: "SRID=4326;POLYGON((0 0,10 0,10 10,0 10,0 0))"
   *         },
   *         srid: 4326,
   *       }
   *     }
   *   }
   * });
   * ```
   *
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
   */
  public compute = async (
    request: GeospatialJsonComputeOutput
  ): Promise<GeospatialComputedItemList> => {
    const path = this.url();
    const response = await this.post<GeospatialComputedItemList>(path, {
      data: request,
    });
    return response.data;
  };
}
