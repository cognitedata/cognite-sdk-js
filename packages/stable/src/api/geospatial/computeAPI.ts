import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  GeospatialComputedItemList,
  GeospatialJsonComputeOutput,
} from './types';

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
