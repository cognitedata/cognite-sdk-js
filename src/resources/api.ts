// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { Metadata, MetadataMap } from '../metadata';
import { ApiKeysAPI, generateApiKeysObject } from './apiKeys';
import {
  AssetMappings3DAPI,
  generateAssetMappings3DObject,
} from './assetMappings3D';
import { AssetsAPI, generateAssetsObject } from './assets';
import { DatapointsAPI, generateDatapointsObject } from './datapoints';
import { EventsAPI, generateEventsObject } from './events';
import { FilesAPI, generateFilesObject } from './files';
import { Files3DAPI, generateFiles3DObject } from './files3D';
import { generateGroupsObject, GroupsAPI } from './groups';
import { generateModels3DObject, Models3DAPI } from './models3D';
import { generateProjectObject, ProjectsAPI } from './projects';
import { generateRawObject, RawAPI } from './raw';
import { generateRevisions3DObject, Revisions3DAPI } from './revisions3D';
import {
  generateSecurityCategoryObject,
  SecurityCategoriesAPI,
} from './securityCategories';
import {
  generateServiceAccountsObject,
  ServiceAccountsAPI,
} from './serviceAccounts';
import { generateTimeseriesObject, TimeseriesAPI } from './timeseries';
import { generateViewer3DObject, Viewer3DAPI } from './viewer3D';

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
  projects: ProjectsAPI;
  groups: GroupsAPI;
  securityCategories: SecurityCategoriesAPI;
  serviceAccounts: ServiceAccountsAPI;
  models3D: Models3DAPI;
  revisions3D: Revisions3DAPI;
  files3D: Files3DAPI;
  assetMappings3D: AssetMappings3DAPI;
  viewer3D: Viewer3DAPI;
  apiKeys: ApiKeysAPI;
  _instance: AxiosInstance;
}

/** @hidden */
export function generateAPIObject(
  project: string,
  axiosInstance: AxiosInstance,
  metadataMap: MetadataMap
): API {
  const defaultArgs: [string, AxiosInstance, MetadataMap] = [
    project,
    axiosInstance,
    metadataMap,
  ];
  return {
    project,
    get: (path, options) =>
      rawRequest(axiosInstance, { method: 'get', url: path, ...options }).then(
        responseTransformer
      ),
    getMetadata: value => metadataMap.get(value),
    assets: generateAssetsObject(...defaultArgs),
    timeseries: generateTimeseriesObject(...defaultArgs),
    datapoints: generateDatapointsObject(...defaultArgs),
    events: generateEventsObject(...defaultArgs),
    files: generateFilesObject(...defaultArgs),
    raw: generateRawObject(...defaultArgs),
    projects: generateProjectObject(axiosInstance, metadataMap),
    groups: generateGroupsObject(...defaultArgs),
    securityCategories: generateSecurityCategoryObject(...defaultArgs),
    serviceAccounts: generateServiceAccountsObject(...defaultArgs),
    models3D: generateModels3DObject(...defaultArgs),
    revisions3D: generateRevisions3DObject(...defaultArgs),
    files3D: generateFiles3DObject(...defaultArgs),
    assetMappings3D: generateAssetMappings3DObject(...defaultArgs),
    viewer3D: generateViewer3DObject(...defaultArgs),
    apiKeys: generateApiKeysObject(...defaultArgs),
    _instance: axiosInstance,
  };
}
