// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { apiUrl, projectUrl, rawGet, rawPost } from './core';

export interface TimeSeriesWithAggregates {
  name: string;
  aggregates?: string[];
  missingDataStrategy?: string;
}

export interface TsTrainDataSpec {
  timeSeries: TimeSeriesWithAggregates[];
  aggregates: string[];
  granularity: string;
  missingDataStrategy?: string;
  start?: string;
  end?: string;
  label?: string;
}

export interface PatternSearchArguments {
  limit?: number;
  minRange?: string;
  maxRange?: string;
}

export interface AnalyticsPatternSearchParams {
  timeSeriesDataSpec: TsTrainDataSpec[];
  description?: string;
  algorithm?: string;
  arguments?: PatternSearchArguments;
}

interface AnalyticsJobIdResponse {
  jobId: number;
}

export interface AnalyticsJob {
  createdTime: number;
  completedTime?: number;
  description?: string;
  id: number;
  project?: string;
  service?: string;
  status?: string;
}

export interface AnalyticsJobResult {
  from: number;
  to: number;
  score: number;
}

interface AnalyticsPatternSearchResultResponse {
  data: {
    items: AnalyticsJobResult[];
  };
}

/**
 * @hidden
 */
const analyticsUrl = (): string => `${apiUrl(0.5)}/${projectUrl()}/analytics`;

export class Analytics {
  public static async launchPatternSearch(
    params: AnalyticsPatternSearchParams
  ): Promise<number> {
    const body = params;
    const url = `${analyticsUrl()}/patternsearch/search`;
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      AnalyticsJobIdResponse
    >;
    return response.data.jobId;
  }

  public static async retrievePatternSearchJobInfo(
    jobId: number
  ): Promise<AnalyticsJob> {
    const url = `${analyticsUrl()}/jobs/${jobId}`;
    const response = (await rawGet(url)) as AxiosResponse<AnalyticsJob>;
    return response.data;
  }

  public static async retrievePatternSearchResult(
    jobId: number
  ): Promise<AnalyticsJobResult[]> {
    const url = `${analyticsUrl()}/patternsearch/${jobId}`;
    const response = (await rawGet(url)) as AxiosResponse<
      AnalyticsPatternSearchResultResponse
    >;
    return response.data.data.items;
  }
}
