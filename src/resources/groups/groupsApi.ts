// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../../axiosWrappers';
import { convertAxiosResponseToMetadata, MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpoint,
  generateListNoCursorEndpointWithQueryParams,
} from '../../standardMethods';
import {
  CogniteInternalId,
  Group,
  GroupServiceAccount,
  GroupSpec,
  ListGroups,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class GroupsAPI {
  private path: string;
  private instance: AxiosInstance;
  private map: MetadataMap;
  private listEndpoint: GroupsListEndpoint;
  private createEndpoint: GroupsCreateEndpoint;
  private deleteEndpoint: GroupsDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = (this.path = projectUrl(project) + '/groups');
    this.instance = instance;
    this.map = map;
    this.listEndpoint = generateListNoCursorEndpointWithQueryParams(
      instance,
      path,
      map
    );
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [List groups](https://doc.cognitedata.com/api/v1/#operation/getGroups)
   *
   * ```js
   * const groups = await client.groups.list({ all: true });
   * ```
   */
  public list: GroupsListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

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
  public create: GroupsCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [Delete groups](https://doc.cognitedata.com/api/v1/#operation/deleteGroups)
   *
   * ```js
   * await client.groups.delete([921923342342323, 871621872721323]);
   * ```
   */
  public delete: GroupsDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };

  /**
   * [List service accounts in a group](https://doc.cognitedata.com/api/v1/#operation/getMembersOfGroups)
   *
   * ```js
   * const serviceAccounts = await client.groups.listServiceAccounts(921923342342323);
   * ```
   */
  public listServiceAccounts: GroupsListServiceAccountsEndpoint = groupId => {
    return generateListNoCursorEndpoint<GroupServiceAccount>(
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
    return this.map.addAndReturn({}, convertAxiosResponseToMetadata(response));
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
    return this.map.addAndReturn({}, convertAxiosResponseToMetadata(response));
  };

  private serviceAccountPath = (groupId: number) =>
    `${this.path}/${groupId}/serviceaccounts`;
}

export type GroupsListEndpoint = (scope?: ListGroups) => Promise<Group[]>;

export type GroupsCreateEndpoint = (items: GroupSpec[]) => Promise<Group[]>;

export type GroupsDeleteEndpoint = (ids: CogniteInternalId[]) => Promise<{}>;

export type GroupsListServiceAccountsEndpoint = (
  groupId: CogniteInternalId
) => Promise<GroupServiceAccount[]>;

export type GroupsAddServiceAccountsEndpoint = (
  groupId: CogniteInternalId,
  serviceAccountIds: CogniteInternalId[]
) => Promise<{}>;

export type GroupsRemoveServiceAccountsEndpoint = (
  groupId: CogniteInternalId,
  serviceAccountIds: CogniteInternalId[]
) => Promise<{}>;
