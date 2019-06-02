// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { rawRequest } from '../axiosWrappers';
import { Metadata, MetadataMap } from '../metadata';
import { AssetMappings3DAPI } from './3d/assetMappings3DApi';
import { Files3DAPI } from './3d/files3DApi';
import { Models3DAPI } from './3d/models3DApi';
import { Revisions3DAPI } from './3d/revisions3DApi';
import { Viewer3DAPI } from './3d/viewer3DApi';
import { ApiKeysAPI } from './apiKeys/apiKeysApi';
import { AssetsAPI } from './assets/assetsApi';
import { DataPointsAPI } from './dataPoints/dataPointsApi';
import { EventsAPI } from './events/eventsApi';
import { FilesAPI } from './files/filesApi';
import { GroupsAPI } from './groups/groupsApi';
import { ProjectsAPI } from './projects/projectsApi';
import { RawAPI } from './raw/rawApi';
import { SecurityCategoriesAPI } from './securityCategories/securityCategoriesApi';
import { ServiceAccountsAPI } from './serviceAccounts/serviceAccountsApi';
import { TimeSeriesAPI } from './timeSeries/timeSeriesApi';

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
  timeseries: TimeSeriesAPI;
  datapoints: DataPointsAPI;
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
    assets: new AssetsAPI(...defaultArgs),
    timeseries: new TimeSeriesAPI(...defaultArgs),
    datapoints: new DataPointsAPI(...defaultArgs),
    events: new EventsAPI(...defaultArgs),
    files: new FilesAPI(...defaultArgs),
    raw: new RawAPI(...defaultArgs),
    projects: new ProjectsAPI(axiosInstance, metadataMap),
    groups: new GroupsAPI(...defaultArgs),
    securityCategories: new SecurityCategoriesAPI(...defaultArgs),
    serviceAccounts: new ServiceAccountsAPI(...defaultArgs),
    models3D: new Models3DAPI(...defaultArgs),
    revisions3D: new Revisions3DAPI(...defaultArgs),
    files3D: new Files3DAPI(...defaultArgs),
    assetMappings3D: new AssetMappings3DAPI(...defaultArgs),
    viewer3D: new Viewer3DAPI(...defaultArgs),
    apiKeys: new ApiKeysAPI(...defaultArgs),
    _instance: axiosInstance,
  };
}
