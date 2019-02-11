// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost, rawPut } from './core';

export interface Asset {
  id: number;
  depth?: number;
  name?: string;
  path?: number[];
  parentId?: number;
  description?: string;
  metadata?: { [k: string]: string };
  source?: string;
  sourceId?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  refId?: string;
  parentName?: string;
  parentRefId?: string;
}

interface AssetDataResponse {
  data: {
    items: Asset[];
  };
}

export interface AssetDataWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: Asset[];
}

interface AssetDataWithCursorResponse {
  data: AssetDataWithCursor;
}

export interface AssetListParams {
  name?: string;
  fuzziness?: number;
  path?: (string | number)[];
  depth?: number;
  metadata?: { [k: string]: string };
  description?: string;
  source?: string;
  cursor?: string;
  limit?: number;
}

export interface AssetListDescendantsParams {
  depth?: number;
  cursor?: string;
  limit?: number;
}

export interface AssetSearchParams {
  name?: string;
  description?: string;
  query?: string;
  metadata?: { [k: string]: string };
  assetSubtrees?: number[];
  minCreatedTime?: number;
  maxCreatedTime?: number;
  minLastUpdatedTime?: number;
  maxLastUpdatedTime?: number;
  sort?: 'createdTime' | 'lastUpdatedTime';
  dir?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  boostName?: boolean;
}

/**
 * @hidden
 */
const assetsUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/assets`;

export class Assets {
  public static async create(assets: Partial<Asset>[]): Promise<Asset[]> {
    const body = {
      items: assets,
    };
    const url = assetsUrl();
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      AssetDataResponse
    >;
    return response.data.data.items;
  }

  public static async retrieve(assetId: number): Promise<Asset> {
    const url = `${assetsUrl()}/${assetId}`;
    const response = (await rawGet(url)) as AxiosResponse<AssetDataResponse>;
    return response.data.data.items[0];
  }

  public static async retrieveMultiple(assetIds: number[]): Promise<Asset[]> {
    const body = {
      items: assetIds,
    };
    const url = `${assetsUrl()}/byids`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      AssetDataResponse
    >;
    return response.data.data.items;
  }

  public static async update(assetId: number, changes: object): Promise<Asset> {
    const url = `${assetsUrl()}/${assetId}/update`;
    const response = (await rawPost(url, { data: changes })) as AxiosResponse<
      AssetDataResponse
    >;
    return response.data.data.items[0];
  }

  public static async updateMultiple(changes: object[]): Promise<Asset[]> {
    const body = {
      items: changes,
    };
    const url = `${assetsUrl()}/update`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      AssetDataResponse
    >;
    return response.data.data.items;
  }

  public static async overwriteMultiple(assets: Asset[]): Promise<void> {
    const body = {
      items: assets,
    };
    const url = `${assetsUrl()}`;
    await rawPut(url, { data: body });
  }

  public static async delete(assetIds: number[]): Promise<void> {
    const body = {
      items: assetIds,
    };
    const url = `${assetsUrl()}/delete`;
    await rawPost(url, { data: body });
  }

  public static async list(
    params?: AssetListParams
  ): Promise<AssetDataWithCursor> {
    const url = assetsUrl();
    const response = (await rawGet(url, { params })) as AxiosResponse<
      AssetDataWithCursorResponse
    >;
    return response.data.data;
  }

  public static async listDescendants(
    assetId: number,
    params?: AssetListDescendantsParams
  ): Promise<AssetDataWithCursor> {
    const url = `${assetsUrl()}/${assetId}/subtree`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      AssetDataWithCursorResponse
    >;
    return response.data.data;
  }

  public static async search(
    params: AssetSearchParams
  ): Promise<AssetDataWithCursor> {
    const url = `${assetsUrl()}/search`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      AssetDataWithCursorResponse
    >;
    return response.data.data;
  }
}
