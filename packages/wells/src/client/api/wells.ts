import { SpatialRel } from '@cognite/geospatial-sdk-js';
import { Asset, AssetsAPI, IdEither } from '@cognite/sdk';
import { Well } from '../model/Well';
import { WellHeadLocation } from '../model/WellHeadLocation';
import { geospatialClient } from './utils';

export class Wells extends AssetsAPI {
  /**
   * converts asset metadata into a wellheadlocation
   *
   * ```js
   * var wells: WellHeadLocation = Wells.mapToWellHeadLocation(asset);
   * ```
   *
   * @param asset
   */
  static mapToWellHeadLocation = (asset: Asset): WellHeadLocation => {
    // @ts-ignore
    return <WellHeadLocation>{
      // @ts-ignore
      crs: asset.metadata['crs'],
      // @ts-ignore
      x: asset.metadata['x'],
      // @ts-ignore
      y: asset.metadata['y'],
    };
  };

  /**
   * converts an asset array into a well array
   * ```js
   * var wells: Well[] = Wells.mapToWell(asset);
   * ```
   * @param assets
   */
  static mapToWell = (assets: Asset[]): Well[] => {
    return assets.map(asset => {
      return <Well>(<unknown>{
        id: asset.id,
        name: asset.name,
        wellHeadLocation: Wells.mapToWellHeadLocation(asset),
      });
    });
  };

  /**
   * A generic template for searching wells based on strict filtering and/or fuzzy filtering
   *
   * ```js
   * const created = await client.wells.searchForWell(exactSearch: {key: val}, fuzzySearch: {key: val});
   * ```
   *
   * @param exactSearch Filter on assets with strict matching.
   * @param fuzzySearch Fulltext search for assets. Primarily meant for for human-centric use-cases, not for programs.
   */
  private searchForWell = async (
    exactSearch = {},
    fuzzySearch = {}
  ): Promise<Asset[]> => {
    const body = {
      filter: {
        metadata: {
          type: 'Well',
        },
        ...exactSearch,
      },
      search: {
        ...fuzzySearch,
      },
    };
    return await this.search(body);
  };

  /**
   * Get wells filtering and/or with fuzzy search on name
   *
   * ```js
   * const created = await client.wells.getWellByName('name');
   * ```
   *
   * @param wellName the full name of the well
   */
  public getWellByName = async (wellName: string): Promise<Well[]> => {
    const exactSearch = { name: wellName };
    return Wells.mapToWell(await this.searchForWell(exactSearch));
  };

  /**
   * Get a list of wells that contains the specified search prefix in the name
   *
   * ```js
   * const created = await client.wells.getWellsByNamePrefix(namePrefix: 'somePrefix');
   * ```
   *
   * @param namePrefix specify a prefix that the wellname should contain
   */
  public getWellsByNamePrefix = async (namePrefix: string): Promise<Well[]> => {
    const fuzzySearch = { name: namePrefix };
    const fuzzyResults = Wells.mapToWell(
      await this.searchForWell({}, fuzzySearch)
    );
    return fuzzyResults.filter(function(well) {
      return well.name.startsWith(namePrefix);
    });
  };

  /**
   * Get a multiple wells filtering and/or with fuzzy search on name
   *
   * ```js
   * const created = await client.wells.getWellsByIds([{id: 123}, {externalId: 'abc'}]);
   * ```
   *
   * @param ids contains unions of internal ids and external ids
   */
  public getWellsByIds = async (ids: IdEither[]): Promise<Well[]> => {
    return Wells.mapToWell(await this.retrieve(ids));
  };

  /**
   * Get a single well filtering and/or with fuzzy search on name
   *
   * ```js
   * const created = await client.wells.getWellById(id: 123);
   * ```
   *
   * @param id specific internal id for a particular well
   */
  public getWellById = async (id: number): Promise<Well[]> => {
    return await this.getWellsByIds([{ id: id }]);
  };

  /**
   * Receives a geoJson polygon like in Discover and return a list of well objects
   *
   * ```js
   * const created = await client.wells.getWellsByPolygon(....);
   * ```
   *
   * @param polygon lat and lon that make up a polygon
   * @param source the source of spatial objects
   * @param crs coordinate reference system of the spatial objects
   * @param layerName the layer to which objects belong
   * @param limit max number of objects to be returned
   * @param offset the starting offset of objects in the results
   */
  public getWellsByPolygon = async ({
    polygon,
    source = 'wellmodel',
    crs = 'epsg:4326',
    layerName = 'point',
    limit = 1000,
    offset = 0,
  }: {
    polygon: string;
    source?: string;
    crs?: string;
    layerName?: string;
    limit?: number;
    offset?: number;
  }): Promise<Well[]> => {
    const geometryBody = {
      wkt: polygon,
      crs: crs,
    };

    const geometryRelBody = {
      geometry: geometryBody,
      relation: SpatialRel.Within,
    };

    const points: any[] = [];
    let i = 0;
    do {
      /*eslint-disable */
      var page = await geospatialClient.findSpatial({
        layer: layerName,
        geometry_rel: geometryRelBody,
        source: source,
        limit: limit,
        offset: offset,
      });
      points.push.apply(points, page);
      /*eslint-enable */
      i++;
      offset = i * limit;
    } while (page.length == limit); // if limit reached, use pagination
    const assetIds: IdEither[] = points.map(x => {
      // @ts-ignore
      return { id: x.assetIds[0] };
    });

    return await this.getWellsByIds(assetIds);
  };
}
