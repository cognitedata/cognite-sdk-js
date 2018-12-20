// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';

export interface ApiKey {
  value?: string;
  id: number;
  userId: number;
  createdTime: number;
  status: string;
}

interface ApiKeyResponse {
  data: {
    items: ApiKey[];
  };
}

export interface ApiKeyListParams {
  all?: boolean;
  userId?: number;
  includeDeleted?: boolean;
}

/**
 * @hidden
 */
const apiKeysUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/apikeys`;

export class ApiKeys {
  public static async create(userIds: number[]): Promise<ApiKey[]> {
    const body = {
      items: userIds.map(userId => ({ userId })),
    };
    const url = apiKeysUrl();
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      ApiKeyResponse
    >;
    return response.data.data.items;
  }

  public static async delete(apiKeyIds: number[]): Promise<void> {
    const url = `${apiKeysUrl()}/delete`;
    const body = {
      items: apiKeyIds,
    };
    await rawPost(url, { data: body });
  }

  public static async list(params?: ApiKeyListParams): Promise<ApiKey[]> {
    const url = apiKeysUrl();
    const response = (await rawGet(url, { params })) as AxiosResponse<
      ApiKeyResponse
    >;
    return response.data.data.items;
  }
}
