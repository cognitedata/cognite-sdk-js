// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../../axiosWrappers';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpoint,
  generateListNoCursorEndpointWithQueryParams,
} from '../../standardMethods';
import { CogniteInternalId, ListGroups } from '../../types/custom';
import { Group, GroupSpec, ServiceAccount } from '../../types/types';
import { projectUrl } from '../../utils';

export class GroupsAPI {
  /**
   * [List groups](https://doc.cognitedata.com/api/v1/#operation/getGroups)
   *
   * ```js
   * const groups = await client.groups.list({ all: true });
   * ```
   */
  public list: GroupsListEndpoint;

  /**
   * [Create groups](https://doc.cognitedata.com/api/v1/#operation/createGroups)
   *
   * ```js
   * const createdGroups = await client.groups.create([{
   *   name: 'Developers',
   *   capabilities: [
   *     { assetsAcl: { actions: ['LIST'] }
   *   ],
   * }]);
   * ```
   */
  public create: GroupsCreateEndpoint;

  /**
   * [Delete groups](https://doc.cognitedata.com/api/v1/#operation/deleteGroups)
   *
   * ```js
   * await client.groups.delete([921923342342323, 871621872721323]);
   * ```
   */
  public delete: GroupsDeleteEndpoint;
  private path: string;
  private instance: AxiosInstance;
  private map: MetadataMap;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = (this.path = projectUrl(project) + '/groups');
    this.instance = instance;
    this.map = map;
    this.list = generateListNoCursorEndpointWithQueryParams(
      instance,
      path,
      map
    );
    this.create = generateCreateEndpoint(instance, path, map);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [List service accounts in a group](https://doc.cognitedata.com/api/v1/#operation/getMembersOfGroups)
   *
   * ```js
   * const serviceAccounts = await client.groups.listServiceAccounts(921923342342323);
   * ```
   */
  public listServiceAccounts: GroupsListServiceAccountsEndpoint = groupId => {
    return generateListNoCursorEndpoint<ServiceAccount>(
      this.instance,
      this.serviceAccountPath(groupId),
      this.map
    )();
  };

  /**
   * [Add service accounts to a group](https://doc.cognitedata.com/api/v1/#operation/addServiceAccountsToGroup)
   *
   * ```js
   * await client.groups.addServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public addServiceAccounts: GroupsAddServiceAccountsEndpoint = async (
    groupId,
    serviceAccountIds
  ) => {
    const response = await rawRequest(
      this.instance,
      {
        url: this.serviceAccountPath(groupId),
        method: 'post',
        data: { items: serviceAccountIds },
      },
      true
    );
    return this.map.addAndReturn({}, response);
  };

  /**
   * [Remove service accounts from a group](https://doc.cognitedata.com/api/v1/#operation/removeServiceAccountsFromGroup)
   *
   * ```js
   * await client.groups.removeServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public removeServiceAccounts: GroupsRemoveServiceAccountsEndpoint = async (
    groupId,
    serviceAccountIds
  ) => {
    const response = await rawRequest(
      this.instance,
      {
        url: `${this.serviceAccountPath(groupId)}/remove`,
        method: 'post',
        data: { items: serviceAccountIds },
      },
      true
    );
    return this.map.addAndReturn({}, response);
  };

  private serviceAccountPath = (groupId: number) =>
    `${this.path}/${groupId}/serviceaccounts`;
}

export type GroupsListEndpoint = (scope?: ListGroups) => Promise<Group[]>;

export type GroupsCreateEndpoint = (items: GroupSpec[]) => Promise<Group[]>;

export type GroupsDeleteEndpoint = (ids: CogniteInternalId[]) => Promise<{}>;

export type GroupsListServiceAccountsEndpoint = (
  groupId: CogniteInternalId
) => Promise<ServiceAccount[]>;

export type GroupsAddServiceAccountsEndpoint = (
  groupId: CogniteInternalId,
  serviceAccountIds: CogniteInternalId[]
) => Promise<{}>;

export type GroupsRemoveServiceAccountsEndpoint = (
  groupId: CogniteInternalId,
  serviceAccountIds: CogniteInternalId[]
) => Promise<{}>;
