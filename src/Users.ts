// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';

export interface User {
  uniqueName: string;
  groups?: number[];
  id?: number;
  isDeleted?: boolean;
  deletedTime?: number;
}

interface UserDataResponse {
  data: {
    items: User[];
  };
}

/**
 * @hidden
 */
const usersUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/users`;

export class Users {
  public static async create(users: Partial<User>[]): Promise<User[]> {
    const body = {
      items: users,
    };
    const url = usersUrl();
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      UserDataResponse
    >;
    return response.data.data.items;
  }

  public static async delete(userIds: number[]): Promise<void> {
    const body = {
      items: userIds,
    };
    const url = `${usersUrl()}/delete`;
    await rawPost(url, { data: body });
  }

  public static async list(): Promise<User[]> {
    const url = usersUrl();
    const response = (await rawGet(url)) as AxiosResponse<UserDataResponse>;
    return response.data.data.items;
  }
}
