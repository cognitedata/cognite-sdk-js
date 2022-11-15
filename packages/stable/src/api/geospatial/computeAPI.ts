import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  GeospatialJsonComputeOutput,
  GeospatialComputeResponse,
} from './types';

export class ComputeAPI extends BaseResourceAPI<GeospatialComputeResponse> {
  /**
   * [Compute custom json output structures or well known binary format responses based on calculation or selection of feature properties or direct values given in the request.](https://docs.cognite.com/api/v1/#operation/compute)
   *
   */
  public compute = async (
    request: GeospatialJsonComputeOutput
  ): Promise<GeospatialComputeResponse> => {
    const path = this.url();
    const response = await this.post<GeospatialComputeResponse>(path, {
      data: request,
    });
    return response.data;
  };
}
