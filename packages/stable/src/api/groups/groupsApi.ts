// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  Group,
  GroupServiceAccount,
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

  /**
   * [List service accounts in a group](https://doc.cognitedata.com/api/v1/#operation/getMembersOfGroups)
   *
   * ```js
   * const serviceAccounts = await client.groups.listServiceAccounts(921923342342323);
   * ```
   */
  public listServiceAccounts = async (
    groupId: CogniteInternalId
  ): Promise<GroupServiceAccount[]> => {
    const path = this.encodeServiceAccountUrl(groupId);
    const response = await this.get<ItemsWrapper<GroupServiceAccount[]>>(path);
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Add service accounts to a group](https://doc.cognitedata.com/api/v1/#operation/addServiceAccountsToGroup)
   *
   * ```js
   * await client.groups.addServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public addServiceAccounts = async (
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ): Promise<object> => {
    const path = this.encodeServiceAccountUrl(groupId);
    const response = await this.post<object>(path, {
      data: { items: serviceAccountIds },
    });
    return this.addToMapAndReturn({}, response);
  };

  /**
   * [Remove service accounts from a group](https://doc.cognitedata.com/api/v1/#operation/removeServiceAccountsFromGroup)
   *
   * ```js
   * await client.groups.removeServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public removeServiceAccounts = async (
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ): Promise<object> => {
    const path = `${this.encodeServiceAccountUrl(groupId)}/remove`;
    const response = await this.post<object>(path, {
      data: { items: serviceAccountIds },
    });
    return this.addToMapAndReturn({}, response);
  };

  private encodeServiceAccountUrl = (groupId: number) =>
    this.url(`${groupId}/serviceaccounts`);
}
