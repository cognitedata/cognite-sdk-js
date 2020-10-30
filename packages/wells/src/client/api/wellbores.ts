//import { SpatialRel, GeometryRel } from '@cognite/geospatial-sdk-js';
import { Asset, AssetsAPI } from '@cognite/sdk';
import { SearchWellbores, Wellbore } from '../model/Wellbore';
//import { WellHeadLocation } from '../model/WellHeadLocation';
//import { geospatialClient } from './utils';
//import { GeoJson } from '../model/GeoJson';

export class Wellbores extends AssetsAPI {
  /**
   * converts asset into a wellbore
   *
   * ```js
   * var wells: WellHeadLocation = Wellbores.mapToWellHeadLocation(asset);
   * ```
   *
   * @param asset
   */
  static mapToWellbore = (assets: Asset[]): Wellbore[] => {
    return assets.map(asset => {
      return <Wellbore>{
        id: asset.id,
        name: asset.name,
        parentId: asset.parentId,
        metadata: asset.metadata,
      };
    });
  };

  /**
   * A generic template for searching wellbores based on strict filtering and/or fuzzy filtering
   *
   * ```js
   * const created = await client.wellbores.searchAssets(exactSearch: {key: val}, fuzzySearch: {key: val});
   * ```
   *
   * @param exactSearch Filter on assets with strict matching.
   * @param fuzzySearch Fulltext search for assets. Primarily meant for for human-centric use-cases, not for programs.
   */
  private searchAssets = async (
    exactSearch = {},
    fuzzySearch = {}
  ): Promise<Asset[]> => {
    const body = {
      filter: {
        metadata: {
          type: 'Wellbore',
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
   * List all wellbores
   *
   * ```js
   * const created = await client.wells.listAll();
   * ```
   *
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Wellbore[]>
   */
  public listAll = async (
    customFilter?: SearchWellbores
  ): Promise<Wellbore[]> => {
    if (customFilter) {
      return await customFilter();
    }
    return Wellbores.mapToWellbore(await this.searchAssets());
  };

  /**
   * Get all wellbores that are immediate children of an parentId
   *
   * ```js
   * const created = await client.wellbores.listChildren(parentId: 31647372237);
   * ```
   *
   * @param parentId the parent Id of a particular asset
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Wellbore[]>
   */
  public listChildren = async (
    parentId: number,
    customFilter?: SearchWellbores
  ) => {
    if (customFilter) {
      return await customFilter(parentId);
    }

    const exactSearch = { parentIds: [parentId] };
    return Wellbores.mapToWellbore(await this.searchAssets(exactSearch));
  };

  /**
   * List assets (wellbores) in subtrees rooted at the specified assets (wells)
   *
   * ```js
   * const created = await client.wellbores.listByWellId(wellId: 21646274724);
   * ```
   *
   * @param parentId the parent Id of a particular asset
   * @param customFilter a custom filter you can apply, input: any -> output: Promise<Wellbore[]>
   */
  public listByWellId = async (
    wellId: number,
    customFilter?: SearchWellbores
  ) => {
    if (customFilter) {
      return await customFilter(wellId);
    }

    const exactSearch = { assetSubtreeIds: [{ id: wellId }] };
    return Wellbores.mapToWellbore(await this.searchAssets(exactSearch));
  };
}
