// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { Metadata, MetadataMap } from '../metadata';
import { AssetAPI, generateAssetsObject } from './assets';
import { DatapointsAPI, generateDatapointsObject } from './datapoints';
import { EventAPI, generateEventsObject } from './events';
import { FileAPI, generateFilesObject } from './files';
import { generateRawObject, RawAPI } from './raw';
import { generateTimeseriesObject, TimeseriesAPI } from './timeseries';

export interface BaseRequestOptions {
  params?: object;
  headers?: { [key: string]: string };
  responseType?: 'json' | 'arraybuffer' | 'text';
}

export interface Response {
  data: any;
  headers: { [key: string]: string };
  status: number;
}

function responseTransformer(axiosResponse: AxiosResponse): Response {
  const { data, headers, status } = axiosResponse;
  return {
    data,
    headers,
    status,
  };
}

export interface API {
  project: string;
  get: (path: string, options?: BaseRequestOptions) => Promise<Response>;
  getMetadata: (value: any) => undefined | Metadata;
  assets: AssetAPI;
  timeseries: TimeseriesAPI;
  datapoints: DatapointsAPI;
  events: EventAPI;
  files: FileAPI;
  raw: RawAPI;
  _instance: AxiosInstance;
}

/** @hidden */
export function generateAPIObject(
  project: string,
  axiosInstance: AxiosInstance,
  metadataMap: MetadataMap
): API {
  return {
    project,
    get: (path, options) =>
      rawRequest(axiosInstance, { method: 'get', url: path, ...options }).then(
        responseTransformer
      ),
    getMetadata: value => metadataMap.get(value),
    assets: generateAssetsObject(project, axiosInstance, metadataMap),
    timeseries: generateTimeseriesObject(project, axiosInstance, metadataMap),
    datapoints: generateDatapointsObject(project, axiosInstance, metadataMap),
    events: generateEventsObject(project, axiosInstance, metadataMap),
    files: generateFilesObject(project, axiosInstance, metadataMap),
    raw: generateRawObject(project, axiosInstance, metadataMap),
    _instance: axiosInstance,
  };
}
