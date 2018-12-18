// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';
import { User } from './Users';

export interface Permissions {
  accessTypes?: string[];
  assetIds?: number[];
  securityCategoryIds?: number[];
}

export interface Group {
  id: number;
  name?: string;
  source?: string;
  sourceId?: string;
  permissions?: Permissions;
  isDeleted?: boolean;
  deletedTime?: number;
}

interface GroupDataResponse {
  data: {
    items: Group[];
  };
}

interface GroupListParams {
  all?: boolean;
}

/**
 * @hidden
 */
const groupsUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/groups`;

export class Groups {
  public static async create(groups: Partial<Group>[]): Promise<Group[]> {
    const body = {
      items: groups,
    };
    const url = groupsUrl();
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      GroupDataResponse
    >;
    return response.data.data.items;
  }

  public static async delete(groupIds: number[]): Promise<void> {
    const body = {
      items: groupIds,
    };
    const url = `${groupsUrl()}/delete`;
    await rawPost(url, { data: body });
  }

  public static async list(params?: GroupListParams): Promise<Group[]> {
    const url = groupsUrl();
    const response = (await rawGet(url, { params })) as AxiosResponse<
      GroupDataResponse
    >;
    return response.data.data.items;
  }

  public static async listUsers(groupId: number): Promise<User[]> {
    const url = `${groupsUrl()}/${groupId}/users`;
    const response = (await rawGet(url)) as AxiosResponse<any>;
    return response.data.data.items;
  }

  public static async addUsers(
    groupId: number,
    userIds: number[]
  ): Promise<void> {
    const url = `${groupsUrl()}/${groupId}/users`;
    const body = {
      items: userIds.map(userId => ({ id: userId })),
    };
    await rawPost(url, { data: body });
  }

  public static async removeUsers(
    groupId: number,
    userIds: number[]
  ): Promise<void> {
    const url = `${groupsUrl()}/${groupId}/users/remove`;
    const body = {
      items: userIds,
    };
    await rawPost(url, { data: body });
  }
}
