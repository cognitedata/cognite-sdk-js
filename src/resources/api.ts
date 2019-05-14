// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { Metadata, MetadataMap } from '../metadata';
import {
  AssetMappings3DAPI,
  generateAssetMappings3DObject,
} from './assetMappings3D';
import { AssetsAPI, generateAssetsObject } from './assets';
import { DatapointsAPI, generateDatapointsObject } from './datapoints';
import { EventsAPI, generateEventsObject } from './events';
import { FilesAPI, generateFilesObject } from './files';
import { generateRawObject, RawAPI } from './raw';
import {
  generateSecurityCategoryObject,
  SecurityCategoriesAPI,
} from './securityCategories';
import {
  generateServiceAccountsObject,
  ServiceAccountsAPI,
} from './serviceAccounts';
import { generateTimeseriesObject, TimeseriesAPI } from './timeseries';
import { Files3DAPI, generateFiles3DObject } from './files3D';
import { generateModels3DObject, Models3DAPI } from './models3D';
import { generateRawObject, RawAPI } from './raw';
import { generateRevisions3DObject, Revisions3DAPI } from './revisions3d';
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
  raw: RawAPI;
  securityCategories: SecurityCategoriesAPI;
  serviceAccounts: ServiceAccountsAPI;
  models3D: Models3DAPI;
  revisions3D: Revisions3DAPI;
  files3D: Files3DAPI;
  assetMappings3D: AssetMappings3DAPI;
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
    securityCategories: generateSecurityCategoryObject(
      project,
      axiosInstance,
      metadataMap
    ),
    serviceAccounts: generateServiceAccountsObject(
      project,
      axiosInstance,
      metadataMap
    ),
    models3D: generateModels3DObject(project, axiosInstance, metadataMap),
    revisions3D: generateRevisions3DObject(project, axiosInstance, metadataMap),
    files3D: generateFiles3DObject(project, axiosInstance, metadataMap),
    assetMappings3D: generateAssetMappings3DObject(
      project,
      axiosInstance,
      metadataMap
    ),
    _instance: axiosInstance,
  };
}
