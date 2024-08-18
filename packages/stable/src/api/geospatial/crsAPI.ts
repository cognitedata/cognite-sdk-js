import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  GeospatialCRSResponse,
  GeospatialCoordinateReferenceSystem,
  GeospatialSridId,
} from './types';

export class CrsAPI extends BaseResourceAPI<GeospatialCRSResponse> {
  /**
   * [Create Coordinate Reference Systems](https://docs.cognite.com/api/v1/#operation/createGeospatialCoordinateReferenceSystems)
   *
   * ```js
   * const crsToCreate = [{
   *  srid: 456789,
   *  wkt: 'GEOGCS[\"WGS 84\",DATUM[\"WGS_1984\",SPHEROID[\"WGS 84\",6378137,298.257223563,AUTHORITY[\"EPSG\",\"7030\"]],AUTHORITY[\"EPSG\",\"6326\"]],PRIMEM[\"Greenwich\",0,AUTHORITY[\"EPSG\",\"8901\"]],UNIT[\"degree\",0.0174532925199433,AUTHORITY[\"EPSG\",\"9122\"]],AUTHORITY[\"EPSG\",\"4326\"]]',
   *  projString: '+proj=longlat +datum=WGS84 +no_defs \"\"'
   *  }];
   *
   * const createdCRS = await client.geospatial.crs.create(crsToCreate);
   * ```
   */
  public create = (
    crs: GeospatialCoordinateReferenceSystem[]
  ): Promise<GeospatialCRSResponse[]> => {
    return this.createEndpoint<GeospatialCoordinateReferenceSystem>(crs);
  };

  /**
   * [Get Coordinate Reference Systems](https://docs.cognite.com/api/v1/#operation/getCoordinateReferenceSystem)
   *
   * ```js
   * const retrievedCRS = await client.geospatial.crs.retrieve([{ srid: 4326 }]);
   * ```
   */
  public retrieve = (
    srids: GeospatialSridId[]
  ): Promise<GeospatialCRSResponse[]> => {
    // @ts-ignore geospatial team should accept ids probably to be in synergy with sdk
    return this.retrieveEndpoint<object, GeospatialSridId>(srids);
  };

  /**
   * [List Coordinate Reference Systems](https://docs.cognite.com/api/v1/#operation/listGeospatialCoordinateReferenceSystems)
   *
   * ```js
   * const allCRS = await client.geospatial.crs.list({ filterOnlyCustom : true });
   * ```
   */
  public list = (params?: {
    filterOnlyCustom?: boolean;
  }): CursorAndAsyncIterator<GeospatialCRSResponse> => {
    return this.listEndpoint<{
      filterOnlyCustom?: boolean;
      limit?: number; // just to match underlying QueryType, crs doesn't have limit
    }>(this.callListEndpointWithGet, params);
  };

  /**
   * [Delete Coordinate Reference Systems](https://docs.cognite.com/api/v1/#operation/deleteGeospatialCoordinateReferenceSystems)
   *
   * ```js
   * await client.geospatial.crs.delete([{ srid: 4326}]);
   * ```
   */
  public delete = (srids: GeospatialSridId[]) => {
    return this.deleteEndpoint<object, GeospatialSridId>(srids);
  };
}
