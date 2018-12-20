// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawDelete, rawGet, rawPost } from './core';

export interface Datapoint {
  timestamp: number;
  value: number | string;
}

export interface DataDatapoint {
  items: Datapoint[];
}

export interface DataDatapoints {
  name: string;
  datapoints: Datapoint[];
}

interface DatapointsResponse {
  data: {
    items: DataDatapoints[];
  };
}

export interface DatapointsRetrieveParams {
  start?: number;
  end?: number;
  aggregates?: string;
  granularity?: string;
  limit?: number;
  includeOutsidePoints?: boolean;
}

export interface DatapointsFunctionInputAlias {
  id: number;
  alias: string;
  aggregate?: string;
  granularity?: string;
}

export interface DatapointsQuery {
  function?: string;
  name: string;
  start?: string | number;
  end?: string | number;
  limit?: number;
  aggregates?: string;
  granularity?: string;
  includeOutsidePoints?: boolean;
  aliases?: DatapointsFunctionInputAlias[];
}

export interface DatapointsMultiQuery {
  items: DatapointsQuery[];
  start?: string | number;
  end?: string | number;
  limit?: number;
  aggregates?: string;
  granularity?: string;
  includeOutsidePoints?: boolean;
}

export interface DatapointsFrameQuery {
  name: string;
  aggregates?: string[];
}

export interface DatapointsFrameMultiQuery {
  items: DatapointsFrameQuery[];
  start?: number | string;
  end?: number | string;
  limit?: number;
  aggregates: string[];
  granularity: string;
}

/**
 * @hidden
 */
const datapointsUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/timeseries`;

export class Datapoints {
  public static async insert(
    timeseriesId: number,
    datapoints: Datapoint[]
  ): Promise<void> {
    const body = {
      items: datapoints,
    };
    const url = `${datapointsUrl()}/${timeseriesId}/data`;
    await rawPost(url, { data: body });
    return;
  }

  public static async insertByName(
    timeseriesName: string,
    datapoints: Datapoint[]
  ): Promise<void> {
    const body = {
      items: datapoints,
    };
    const url = `${datapointsUrl()}/data/${encodeURIComponent(timeseriesName)}`;
    await rawPost(url, { data: body });
    return;
  }

  public static async insertMultiple(
    datapoints: DataDatapoints[]
  ): Promise<void> {
    const body = {
      items: datapoints,
    };
    const url = `${datapointsUrl()}/data`;
    await rawPost(url, { data: body });
    return;
  }

  public static async retrieve(
    timeseriesId: number,
    params?: DatapointsRetrieveParams
  ): Promise<DataDatapoints> {
    const url = `${datapointsUrl()}/${timeseriesId}/data`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DatapointsResponse
    >;
    return response.data.data.items[0];
  }

  public static async retrieveByName(
    timeseriesName: string,
    params?: DatapointsRetrieveParams
  ): Promise<DataDatapoints> {
    const url = `${datapointsUrl()}/data/${encodeURIComponent(timeseriesName)}`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      DatapointsResponse
    >;
    return response.data.data.items[0];
  }

  public static async retrieveMultiple(
    query: DatapointsMultiQuery
  ): Promise<DataDatapoints[]> {
    const body = query;
    const url = `${datapointsUrl()}/dataquery`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      DatapointsResponse
    >;
    return response.data.data.items;
  }

  public static async retrieveLatest(
    timeseriesName: string,
    before?: number
  ): Promise<Datapoint[]> {
    const url = `${datapointsUrl()}/latest/${encodeURIComponent(
      timeseriesName
    )}`;
    const params = { before };
    const response = (await rawGet(url, { params })) as AxiosResponse<any>;
    return response.data.data.items[0].datapoints;
  }

  public static async retrieveCSV(
    query: DatapointsFrameMultiQuery
  ): Promise<string> {
    const url = `${datapointsUrl()}/dataframe`;
    const body = query;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      string
    >;
    return response.data;
  }

  public static async delete(
    timeseriesName: string,
    timestamp: number
  ): Promise<void> {
    const url = `${datapointsUrl()}/data/${encodeURIComponent(
      timeseriesName
    )}/deletesingle`;
    const params = { timestamp };
    await rawDelete(url, { params });
  }

  public static async deleteRange(
    timeseriesName: string,
    timestampInclusiveBegin: number,
    timestampExclusiveEnd: number
  ): Promise<void> {
    const url = `${datapointsUrl()}/data/${encodeURIComponent(
      timeseriesName
    )}/deleterange`;
    const params = { timestampInclusiveBegin, timestampExclusiveEnd };
    await rawDelete(url, { params });
  }
}
