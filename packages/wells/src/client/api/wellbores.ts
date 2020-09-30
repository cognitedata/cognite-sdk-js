import { Asset, AssetsAPI } from '@cognite/sdk';
import { SearchWellbores, Wellbore } from '../model/Wellbore';
import { Survey } from '../model/Survey';
import { Surveys } from './surveys';
import { accessApi } from '@cognite/sdk-core';

export class Wellbores extends AssetsAPI {
  /**
   * Dependecy injection
   *
   * public setter and private getter
   *
   * allows for:
   *
   * ```js
   * var trajectories = this.surveys.listTrajectories(assetId)
   * ```
   */
  private _surveysSDK?: Surveys;

  public set surveysSdk(sdk: Surveys) {
    this._surveysSDK = sdk;
  }
  private get surveys(): Surveys {
    return accessApi(this._surveysSDK);
  }
  /**
   * Converts asset into a wellbore..
   * Contains lazy getter for trajectories
   *
   * @param asset
   */
  private mapToWellbore = async (assets: Asset[]): Promise<Wellbore[]> => {
    return assets.map(asset => {
      return <Wellbore>{
        id: asset.id,
        name: asset.name,
        parentId: asset.parentId,
        metadata: asset.metadata,
        trajectories: async (): Promise<Survey[]> => {
          return await this.surveys.listTrajectories(asset.id);
        },
      };
    });
  };

  /**
   * A generic template for searching wellbores based on exact filtering
   *
   * ```js
   * const created = await client.wellbores.searchAssets(exactSearch: {key: val});
   * ```
   *
   * @param exactSearch Filter on assets with strict matching.
   */
  private searchAssets = async (exactSearch = {}): Promise<Asset[]> => {
    const body = {
      filter: {
        metadata: {
          type: 'Wellbore',
        },
        ...exactSearch,
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
    return this.mapToWellbore(await this.searchAssets());
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
    return this.mapToWellbore(await this.searchAssets(exactSearch));
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
    return this.mapToWellbore(await this.searchAssets(exactSearch));
  };
}
