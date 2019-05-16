// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpoint,
  generateListNoCursorEndpointWithQueryParams,
} from '../standardMethods';
import {
  CogniteInternalId,
  Group,
  GroupServiceAccount,
  GroupSpec,
  ListGroups,
} from '../types/types';
import { projectUrl } from '../utils';

export interface GroupsAPI {
  /**
   * [List groups](https://doc.cognitedata.com/api/v1/#operation/getGroups)
   *
   * ```js
   * const groups = await client.groups.list({ all: true });
   * ```
   */
  list: (scope?: ListGroups) => Promise<Group[]>;

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
  create: (items: GroupSpec[]) => Promise<Group[]>;

  /**
   * [Delete groups](https://doc.cognitedata.com/api/v1/#operation/deleteGroups)
   *
   * ```js
   * await client.groups.delete([921923342342323, 871621872721323]);
   * ```
   */
  delete: (ids: CogniteInternalId[]) => Promise<{}>;

  /**
   * [List service accounts in a group](https://doc.cognitedata.com/api/v1/#operation/getMembersOfGroups)
   *
   * ```js
   * const serviceAccounts = await client.groups.listServiceAccounts(921923342342323);
   * ```
   */
  listServiceAccounts: (
    groupId: CogniteInternalId
  ) => Promise<GroupServiceAccount[]>;

  /**
   * [Add service accounts to a group](https://doc.cognitedata.com/api/v1/#operation/addServiceAccountsToGroup)
   *
   * ```js
   * await client.groups.addServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  addServiceAccounts: (
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ) => Promise<{}>;

  /**
   * [Remove service accounts from a group](https://doc.cognitedata.com/api/v1/#operation/removeServiceAccountsFromGroup)
   *
   * ```js
   * await client.groups.removeServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  removeServiceAccounts: (
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ) => Promise<{}>;
}

/** @hidden */
export function generateGroupsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): GroupsAPI {
  const path = projectUrl(project) + '/groups';
  const getServiceAccountPath = (groupId: number) =>
    `${path}/${groupId}/serviceaccounts`;
  return {
    list: generateListNoCursorEndpointWithQueryParams(instance, path, map),
    create: generateCreateEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
    listServiceAccounts: groupId => {
      return generateListNoCursorEndpoint<GroupServiceAccount>(
        instance,
        getServiceAccountPath(groupId),
        map
      )();
    },
    addServiceAccounts: async (groupId, serviceAccountIds) => {
      const response = await rawRequest(
        instance,
        {
          url: getServiceAccountPath(groupId),
          method: 'post',
          data: { items: serviceAccountIds },
        },
        true
      );
      return map.addAndReturn({}, response);
    },
    removeServiceAccounts: async (groupId, serviceAccountIds) => {
      const response = await rawRequest(
        instance,
        {
          url: `${getServiceAccountPath(groupId)}/remove`,
          method: 'post',
          data: { items: serviceAccountIds },
        },
        true
      );
      return map.addAndReturn({}, response);
    },
  };
}
