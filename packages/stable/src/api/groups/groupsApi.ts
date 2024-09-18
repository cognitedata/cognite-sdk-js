// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  Group,
  GroupSpec,
  ItemsWrapper,
  ListGroups,
} from '../../types';

export class GroupsAPI extends BaseResourceAPI<Group> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['deletedTime']);
  }

  /**
   * [Create groups](https://doc.cognitedata.com/api/v1/#operation/createGroups)
   *
   * ```js
   * const createdGroups = await client.groups.create([{
   *   name: 'Developers',
   *   capabilities: [{
   *     assetsAcl: {
   *       actions: ['READ'],
   *       scope: { all: {}}
   *     }
   *   }],
   * }]);
   * ```
   */
  public create = (items: GroupSpec[]): Promise<Group[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List groups](https://doc.cognitedata.com/api/v1/#operation/getGroups)
   *
   * ```js
   * const groups = await client.groups.list({ all: true });
   * ```
   */
  public list = async (scope?: ListGroups): Promise<Group[]> => {
    const path = this.url();
    const response = await this.get<ItemsWrapper<Group[]>>(path, {
      params: scope,
    });
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Delete groups](https://doc.cognitedata.com/api/v1/#operation/deleteGroups)
   *
   * ```js
   * await client.groups.delete([921923342342323, 871621872721323]);
   * ```
   */
  public delete = (ids: CogniteInternalId[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };
}
