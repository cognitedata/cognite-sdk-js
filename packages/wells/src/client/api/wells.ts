import { Asset, AssetsAPI, IdEither } from '@cognite/sdk';
import { Well } from '../model/Well';
import { WellHeadLocation } from '../model/WellHeadLocation';

// types
//type SearchBy = 'name' | 'query';

export class Wells extends AssetsAPI {

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

  static mapToWell = (assets: Asset[]): Well[] => {
    return assets.map(asset => {
      return <Well>(<unknown>{
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
   * @param wellName
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
   * @param namePrefix
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
   * PS!! This method will be replaced by the Geospatial SDK once
   * that is integrated into the
   *
   */
}
