// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';
import { User } from './Users';

export interface Permissions {
  accessTypes?: string[];
  assetIds?: number[];
  securityCategoryIds?: number[];
}

export type READ = 'READ';
export type WRITE = 'WRITE';
export type LIST = 'LIST';
export type CREATE = 'CREATE';
export type EXECUTE = 'EXECUTE';
export type UPDATE = 'UPDATE';
export type DELETE = 'DELETE';
export type MEMBEROF = 'MEMBEROF';

export interface GroupsAcl {
  groupsAcl: {
    actions?: (LIST | READ | CREATE | UPDATE | DELETE)[];
    scope: {
      all?: {};
      currentuserscope?: {};
    };
  };
}

export interface AssetsAcl {
  assetsAcl: {
    actions?: (READ | WRITE)[];
    scope: {
      all?: {};
    };
  };
}

export interface EventsAcl {
  eventsAcl: {
    actions?: (READ | WRITE)[];
    scope: {
      all?: {};
    };
  };
}

export interface FilesAcl {
  filesAcl: {
    actions?: (READ | WRITE)[];
    scope: {
      all?: {};
    };
  };
}

export interface UsersAcl {
  usersAcl: {
    actions?: (LIST | CREATE | DELETE)[];
    scope: {
      all?: {};
      currentuserscope?: {};
    };
  };
}

export interface ProjectsAcl {
  projectsAcl: {
    actions?: (LIST | READ | CREATE | UPDATE)[];
    scope: {
      all?: {};
    };
  };
}

export interface SecurityCategoriesAcl {
  securityCategoriesAcl: {
    actions?: (MEMBEROF | LIST | CREATE | DELETE)[];
    scope: {
      all?: {};
    };
  };
}

export interface RawAcl {
  rawAcl: {
    actions?: (READ | WRITE | LIST)[];
    scope: {
      all?: {};
    };
  };
}

export interface TimeSeriesAcl {
  timeSeriesAcl: {
    actions?: (READ | WRITE)[];
    scope: {
      all?: {};
      assetIdScope?: {
        subtreeIds: number[];
      };
    };
  };
}

export interface ApiKeysAcl {
  apikeysAcl: {
    actions?: (LIST | CREATE | DELETE)[];
    scope: {
      all?: {};
      currentuserscope?: {};
    };
  };
}

export interface ThreeDAcl {
  threedAcl: {
    actions?: (READ | CREATE | UPDATE | DELETE)[];
    scope: {
      all?: {};
    };
  };
}

export interface SequencesAcl {
  sequencesAcl: {
    actions?: (READ | WRITE)[];
    scope: {
      all?: {};
    };
  };
}

export interface AnalyticsAcl {
  analyticsAcl: {
    actions?: (READ | EXECUTE | LIST)[];
    scope: {
      all?: {};
    };
  };
}

export type Capabilities = (
  | GroupsAcl
  | AssetsAcl
  | EventsAcl
  | FilesAcl
  | UsersAcl
  | ProjectsAcl
  | SecurityCategoriesAcl
  | RawAcl
  | TimeSeriesAcl
  | ApiKeysAcl
  | ThreeDAcl
  | SequencesAcl
  | AnalyticsAcl)[];

export interface Group {
  id: number;
  name?: string;
  source?: string;
  sourceId?: string;
  permissions?: Permissions;
  capabilities?: Capabilities;
  isDeleted?: boolean;
  deletedTime?: number;
}

interface GroupDataResponse {
  data: {
    items: Group[];
  };
}

export interface GroupListParams {
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
