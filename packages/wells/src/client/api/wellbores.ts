import { Wellbore } from '../model/Wellbore';
import { Asset, AssetsAPI } from '@cognite/sdk';

export class Wellbores extends AssetsAPI {
  static mapToWellbore = (assets: Asset[]): Wellbore[] => {
    return assets.map(asset => {
      return <Wellbore>(<unknown>{
        id: asset.id,
        name: asset.name,
        parent_id: asset.parentId,
        metadata: asset.metadata,
      });
    });
  };

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

  public listAll = async () => {
    return Wellbores.mapToWellbore(await this.searchForWellbore());
  };

  public listChildren = async (parentId: number) => {
    const exactSearch = { parentIds: [parentId] };
    return Wellbores.mapToWellbore(await this.searchForWellbore(exactSearch));
  };

  public listAllInWell = async (wellId: number) => {
    const exactSearch = { assetSubtreeIds: [wellId] };
    return Wellbores.mapToWellbore(await this.searchForWellbore(exactSearch));
  };
}
