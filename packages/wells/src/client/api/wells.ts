import { Asset, AssetsAPI, IdEither } from '@cognite/sdk';
import { WellDto } from '../model/WellDto';
import { WellHeadLocationDto } from '../model/WellHeadLocationDto';

// types
//type SearchBy = 'name' | 'query';

export class Wells extends AssetsAPI {
  static mapToWellHeadLocation = (
    asset: Asset
  ): Promise<WellHeadLocationDto> => {
    // @ts-ignore
    return <WellHeadLocationDto>{
      crs: asset.metadata['crs'],
      x: asset.metadata['x'],
      y: asset.metadata['y'],
    };
  };

  static mapToWell = (assets: Asset[]): WellDto[] => {
    return assets.map(asset => {
      return <WellDto>(<unknown>{
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
  public getWellByName = async (wellName: string): Promise<WellDto[]> => {
    const exactSearch = { name: wellName };
    return Wells.mapToWell(await this.searchForWell(exactSearch));
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
  public getWellsByIds = async (ids: IdEither[]): Promise<WellDto[]> => {
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
  public getWellById = async (id: number): Promise<WellDto[]> => {
    return await this.getWellsByIds([{ id: id }]);
  };
}
