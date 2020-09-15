import { Asset, AssetsAPI } from '@cognite/sdk';

// types
type SearchBy = 'name' | 'query';

export class Wells extends AssetsAPI {
  /**
   * Internal method
   *
   * @param name
   * @param extraFilters
   * @param searchBy
   */
  searchForWell = (
    name: string,
    extraFilters = {},
    searchBy: SearchBy = 'query' //default
  ): Promise<Asset[]> => {
    const body = {
      filter: {
        metadata: {
          type: 'well',
        },
        ...extraFilters,
      },
      search: {
        [searchBy]: name,
      },
    };
    return this.search(body);
  };

  /**
   * [Create cool things](https://doc.cognitedata.com/api/v1/projects/subsurface-test/postCoolThing)
   *
   * ```js
   * const created = await client.wells.getWellByName(name);
   * ```
   */
  public getWellByName = (
    wellName: string,
    extraFilters = {}
  ): Promise<Asset[]> => {
    return this.searchForWell(wellName, extraFilters, 'name');
  };
}
