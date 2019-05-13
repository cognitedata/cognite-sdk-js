// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { Metadata, MetadataMap } from '../metadata';
import { AssetsAPI, generateAssetsObject } from './assets';
import { DatapointsAPI, generateDatapointsObject } from './datapoints';
import { generateRawObject, RawAPI } from './raw';
import {
  generateSecurityCategoryObject,
  SecurityCategoriesAPI,
} from './securityCategories';
import { EventsAPI, generateEventsObject } from './events';
import { FilesAPI, generateFilesObject } from './files';
import {
  generateServiceAccountsObject,
  ServiceAccountsAPI,
} from './serviceAccounts';
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
  assets: AssetsAPI;
  timeseries: TimeseriesAPI;
  datapoints: DatapointsAPI;
  events: EventsAPI;
  files: FilesAPI;
  serviceAccounts: ServiceAccountsAPI;
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
    serviceAccounts: generateServiceAccountsObject(
      project,
      axiosInstance,
      metadataMap
    ),
    _instance: axiosInstance,
  };
}
