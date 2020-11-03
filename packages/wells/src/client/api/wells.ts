import { SpatialRel, GeometryRel } from '@cognite/geospatial-sdk-js';
import { Asset, AssetsAPI, IdEither, Label } from '@cognite/sdk';
import { Well, SearchWells, SearchWell } from '../model/Well';
import { WellHeadLocation } from '../model/WellHeadLocation';
import { geospatialClient } from './utils';
import { GeoJson } from '../model/GeoJson';

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
      return <Well>{
        id: asset.id,
        name: asset.name,
        wellHeadLocation: Wells.mapToWellHeadLocation(asset),
        dataSource: Wells.getLabel('DataSource', asset.labels),
        block: Wells.getLabel('Block', asset.labels),
        field: Wells.getLabel('Field', asset.labels),
        operator: Wells.getLabel('Operator', asset.labels),
      };
    });
  };

  static getLabel(type: string, labels: Label[] | undefined): string | void {
    if (labels) {
      for (const element of labels) {
        if (element.externalId.startsWith(type)) {
          return element.externalId.split(':')[1];
        }
      }
    }
  }

  /**
   * A generic template for searching wells based on strict filtering and/or fuzzy filtering
   *
   * ```js
   * const created = await client.wells.listAssets(exactSearch: {key: val}, fuzzySearch: {key: val});
   * ```
   *
   * @param exactSearch Filter on assets with strict matching.
   * @param fuzzySearch Fulltext search for assets. Primarily meant for for human-centric use-cases, not for programs.
   */
  private listAssets = async (
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
   * const created = await client.wells.listByName('name');
   * ```
   *
   * @param wellName the full name of the well
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Well[]>
   */
  public listByName = async (
    wellName: string,
    customFilter?: SearchWells
  ): Promise<Well[]> => {
    if (customFilter) {
      return await customFilter(wellName);
    }

    const exactSearch = { name: wellName };
    return Wells.mapToWell(await this.listAssets(exactSearch));
  };

  /**
   * Get a list of wells that contains the specified search prefix in the name
   *
   * ```js
   * const created = await client.wells.listByNamePrefix(namePrefix: 'somePrefix');
   * ```
   *
   * @param namePrefix specify a prefix that the wellname should contain
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Well[]>
   */
  public listByNamePrefix = async (
    namePrefix: string,
    customFilter?: SearchWells
  ): Promise<Well[]> => {
    if (customFilter) {
      return await customFilter(namePrefix);
    }

    const fuzzySearch = { name: namePrefix };
    const fuzzyResults = Wells.mapToWell(
      await this.listAssets({}, fuzzySearch)
    );
    return fuzzyResults.filter(function(well) {
      return well.name.startsWith(namePrefix);
    });
  };

  /**
   * Get a multiple wells filtering and/or with fuzzy search on name
   *
   * ```js
   * const created = await client.wells.getByIds([{id: 123}, {externalId: 'abc'}]);
   * ```
   *
   * @param ids contains unions of internal ids and external ids
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Well[]>
   */
  public getByIds = async (
    ids: IdEither[],
    customFilter?: SearchWells
  ): Promise<Well[]> => {
    if (customFilter) {
      return await customFilter(ids);
    }

    return Wells.mapToWell(await this.retrieve(ids));
  };

  /**
   * Get a single well filtering and/or with fuzzy search on name
   *
   * ```js
   * const created = await client.wells.getById(id: 123);
   * ```
   *
   * @param id specific internal id for a particular well
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Well[]>
   */
  public getById = async (
    id: number,
    customFilter?: SearchWell
  ): Promise<Well | undefined> => {
    if (customFilter) {
      return await customFilter(id);
    }

    const wells: Well[] = await this.getByIds([{ id: id }]);
    return wells.length == 1 ? wells[0] : undefined;
  };

  /**
   * Receives a geoJson or wkt polygon like in Discover and return a list of well objects
   *
   * ```js
   * const created = await client.wells.searchByPolygon(....);
   * ```
   *
   * @param polygon lat and lon that make up a polygon
   * @param source the source of spatial objects
   * @param crs coordinate reference system of the spatial objects
   * @param layerName the layer to which objects belong
   * @param limit max number of objects to be returned
   * @param offset the starting offset of objects in the results
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Well[]>
   */

  public searchByPolygon = async ({
    geometry,
    crs = 'epsg:4326',
    outputCrs = 'EPSG:4326',
    limit = 1000,
    offset = 0,
    customFilter = undefined,
  }: {
    geometry: string | GeoJson;
    crs?: string;
    outputCrs?: string;
    limit?: number;
    offset?: number;
    customFilter?: SearchWells;
  }): Promise<Well[]> => {
    // custom filters does not have to rely on either CDF or Geospatial API
    // as long as it returns a Promise<Well[]>
    if (customFilter) {
      return await customFilter(geometry);
    }

    const polygon =
      typeof geometry === 'string'
        ? { wkt: geometry, crs }
        : { geojson: geometry, crs };

    const geometryRelBody: GeometryRel = {
      geometry: polygon,
      relation: SpatialRel.Within,
    };

    const points: any[] = [];
    let i = 0;
    do {
      /*eslint-disable */
      var page = await geospatialClient.findSpatial({
        layer: 'point',
        source: 'wellmodel',
        attributes: ['geometry'],
        geometry_rel: geometryRelBody,
        limit: limit,
        offset: offset,
        outputCRS: outputCrs,
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

    return await this.getByIds(assetIds);
  };

  public filterPolygonSearch = async ({
    geometry,
    crs = 'epsg:4326',
    outputCrs = 'EPSG:4326',
    limit = 1000,
    name,
    id,
    data_source,
    operator,
    field,
    block,
    customFilter = undefined,
  }: {
    geometry: string | GeoJson;
    crs?: string;
    outputCrs?: string;
    limit?: number;
    name?: string;
    id?: number;
    data_source?: string[];
    operator?: string[];
    field?: string[];
    block?: string[];
    customFilter?: SearchWells;
  }): Promise<Well[]> => {
    if (customFilter) {
      return await customFilter(geometry);
    }

    let polygonWells = await this.searchByPolygon({
      geometry,
      crs,
      outputCrs,
      limit,
      offset: 0,
    });

    if (name) {
      polygonWells = polygonWells.filter(x => x.name === name);
    }
    if (id) {
      polygonWells = polygonWells.filter(x => x.id === id);
    }
    if (data_source) {
      polygonWells = polygonWells.filter(
        x => x.dataSource && data_source.includes(x.dataSource)
      );
    }
    if (operator) {
      polygonWells = polygonWells.filter(
        x => x.operator && operator.includes(x.operator)
      );
    }
    if (field) {
      polygonWells = polygonWells.filter(
        x => x.field && field.includes(x.field)
      );
    }
    if (block) {
      polygonWells = polygonWells.filter(
        x => x.block && block.includes(x.block)
      );
    }

    return polygonWells;
  };
}
