//import { SpatialRel, GeometryRel } from '@cognite/geospatial-sdk-js';
import { Asset, AssetsAPI } from '@cognite/sdk';
import { Wellbore } from '../model/Wellbore';
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
      return <Wellbore>(<unknown>{
        id: asset.id,
        name: asset.name,
        parentId: asset.parentId,
        metadata: asset.metadata,
      });
    });
  };

  /*
  private searchForWellbore = async (
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
  */
}
