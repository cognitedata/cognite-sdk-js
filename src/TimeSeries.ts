// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawDelete, rawGet, rawPost, rawPut } from './core';

export interface Timeseries {
  name: string;
  isString?: boolean;
  unit?: string;
  assetId?: number;
  isStep?: boolean;
  description?: string;
  securityCategories?: number[];
  metadata?: { [K in string]: string };
  id: number;
  createdTime?: number;
  lastUpdatedTime?: number;
}

interface TimeseriesResponse {
  data: {
    items: Timeseries[];
  };
}

interface TimeseriesWithCursor {
  previousCursor?: string;
  nextCursor?: string;
  items: Timeseries[];
}

interface TimeseriesWithCursorResponse {
  data: TimeseriesWithCursor;
}

export interface TimeseriesListParams {
  q?: string;
  description?: string;
  limit?: number;
  includeMetadata?: boolean;
  cursor?: string;
  assetId?: number;
  path?: string;
}

interface TimeseriesSearchParams {
  description?: string;
  query?: string;
  unit?: string;
  isString?: boolean;
  isStep?: boolean;
  metadata?: { [k: string]: string };
  assetIds?: number[];
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
const timeSeriesUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/timeseries`;

export class TimeSeries {
  public static async create(timeSeries: Partial<Timeseries>[]): Promise<void> {
    const body = {
      items: timeSeries,
    };
    const url = timeSeriesUrl();
    await rawPost(url, { data: body });
    return;
  }

  public static async retrieve(
    timeseriesId: number,
    includeMetadata?: boolean
  ): Promise<Timeseries> {
    const url = `${timeSeriesUrl()}/${timeseriesId}`;
    const params = { includeMetadata };
    const response = (await rawGet(url, { params })) as AxiosResponse<
      TimeseriesResponse
    >;
    return response.data.data.items[0];
  }

  public static async retrieveMultiple(
    timeseriesIds: number[]
  ): Promise<Timeseries[]> {
    const body = {
      items: timeseriesIds,
    };
    const url = `${timeSeriesUrl()}/byids`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      TimeseriesResponse
    >;
    return response.data.data.items;
  }

  public static async update(
    assetId: number,
    changes: object
  ): Promise<Timeseries> {
    const url = `${timeSeriesUrl()}/${assetId}/update`;
    const response = (await rawPost(url, { data: changes })) as AxiosResponse<
      TimeseriesResponse
    >;
    return response.data.data.items[0];
  }

  public static async updateMultiple(changes: object[]): Promise<Timeseries[]> {
    const body = {
      items: changes,
    };
    const url = `${timeSeriesUrl()}/update`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      TimeseriesResponse
    >;
    return response.data.data.items;
  }

  public static async overwriteMultiple(
    timeseries: Timeseries[]
  ): Promise<void> {
    const body = {
      items: timeseries,
    };
    const url = `${timeSeriesUrl()}`;
    await rawPut(url, { data: body });
  }

  public static async delete(name: string): Promise<void> {
    const url = `${timeSeriesUrl()}/${encodeURIComponent(name)}`;
    await rawDelete(url);
  }

  public static async list(
    params?: TimeseriesListParams
  ): Promise<TimeseriesWithCursor> {
    const url = timeSeriesUrl();
    const response = (await rawGet(url, { params })) as AxiosResponse<
      TimeseriesWithCursorResponse
    >;
    return response.data.data;
  }

  public static async search(
    params: TimeseriesSearchParams
  ): Promise<TimeseriesWithCursor> {
    const url = `${timeSeriesUrl()}/search`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      TimeseriesWithCursorResponse
    >;
    return response.data.data;
  }
}
