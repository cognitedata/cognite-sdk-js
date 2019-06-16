// Copyright 2019 Cognite AS

import { AxiosInstance, AxiosResponse } from 'axios';
import { isFunction, isObject, isString } from 'lodash';
import {
  generateAxiosInstance,
  listenForNonSuccessStatusCode,
  rawRequest,
} from './axiosWrappers';
import { MetadataMap } from './metadata';
import { AssetMappings3DAPI } from './resources/3d/assetMappings3DApi';
import { Files3DAPI } from './resources/3d/files3DApi';
import { Models3DAPI } from './resources/3d/models3DApi';
import { Revisions3DAPI } from './resources/3d/revisions3DApi';
import { Viewer3DAPI } from './resources/3d/viewer3DApi';
import { BaseRequestOptions } from './resources/api';
import { ApiKeysAPI } from './resources/apiKeys/apiKeysApi';
import { AssetsAPI } from './resources/assets/assetsApi';
import { DataPointsAPI } from './resources/dataPoints/dataPointsApi';
import { EventsAPI } from './resources/events/eventsApi';
import { FilesAPI } from './resources/files/filesApi';
import { GroupsAPI } from './resources/groups/groupsApi';
import {
  createAuthenticateFunction,
  OnAuthenticate,
  OnAuthenticateLoginObject,
  OnTokens,
} from './resources/login';
import { LoginAPI } from './resources/login/loginApi';
import { ProjectsAPI } from './resources/projects/projectsApi';
import { RawAPI } from './resources/raw/rawApi';
import { SecurityCategoriesAPI } from './resources/securityCategories/securityCategoriesApi';
import { ServiceAccountsAPI } from './resources/serviceAccounts/serviceAccountsApi';
import { TimeSeriesAPI } from './resources/timeSeries/timeSeriesApi';
import { addRetryToAxiosInstance } from './retryRequests';
import { getBaseUrl } from './utils';

export interface ClientOptions {
  /** App identifier (ex: 'FileExtractor') */
  appId: string;
  baseUrl?: string;
}

export interface Project {
  /**
   * Cognite project to login into
   */
  project: string;
}

export interface ApiKeyLoginOptions extends Project {
  /**
   * A Cognite issued api-key
   */
  apiKey: string;
}

export const REDIRECT = 'REDIRECT';
export const POPUP = 'POPUP';
export interface OAuthLoginOptions extends Project {
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
  onTokens?: OnTokens;
}

function validateAndReturnAPI<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithOAuth before you can use the Cognite SDK'
    );
  }
  return api;
}

function throwReLogginError() {
  throw Error(
    'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite client instance instead.'
  );
}

export default class CogniteClient {
  public get assets() {
    return validateAndReturnAPI(this.assetsApi);
  }
  public get timeseries() {
    return validateAndReturnAPI(this.timeSeriesApi);
  }
  public get datapoints() {
    return validateAndReturnAPI(this.dataPointsApi);
  }
  public get events() {
    return validateAndReturnAPI(this.eventsApi);
  }
  public get files() {
    return validateAndReturnAPI(this.filesApi);
  }
  public get raw() {
    return validateAndReturnAPI(this.rawApi);
  }
  public get projects() {
    return validateAndReturnAPI(this.projectsApi);
  }
  public get groups() {
    return validateAndReturnAPI(this.groupsApi);
  }
  public get securityCategories() {
    return validateAndReturnAPI(this.securityCategoriesApi);
  }
  public get serviceAccounts() {
    return validateAndReturnAPI(this.serviceAccountsApi);
  }
  public get models3D() {
    return validateAndReturnAPI(this.models3DApi);
  }
  public get revisions3D() {
    return validateAndReturnAPI(this.revisions3DApi);
  }
  public get files3D() {
    return validateAndReturnAPI(this.files3DApi);
  }
  public get assetMappings3D() {
    return validateAndReturnAPI(this.assetMappings3DApi);
  }
  public get viewer3D() {
    return validateAndReturnAPI(this.viewer3DApi);
  }
  public get apiKeys() {
    return validateAndReturnAPI(this.apiKeysApi);
  }
  public get login() {
    return this.loginApi;
  }

  public project: string = '';
  /** @hidden */
  public instance: AxiosInstance;
  private metadataMap: MetadataMap;
  private hasBeenLoggedIn: boolean = false;
  private assetsApi?: AssetsAPI;
  private timeSeriesApi?: TimeSeriesAPI;
  private dataPointsApi?: DataPointsAPI;
  private eventsApi?: EventsAPI;
  private filesApi?: FilesAPI;
  private rawApi?: RawAPI;
  private projectsApi?: ProjectsAPI;
  private groupsApi?: GroupsAPI;
  private securityCategoriesApi?: SecurityCategoriesAPI;
  private serviceAccountsApi?: ServiceAccountsAPI;
  private models3DApi?: Models3DAPI;
  private revisions3DApi?: Revisions3DAPI;
  private files3DApi?: Files3DAPI;
  private assetMappings3DApi?: AssetMappings3DAPI;
  private viewer3DApi?: Viewer3DAPI;
  private apiKeysApi?: ApiKeysAPI;
  private loginApi: LoginAPI;
  /**
   * Create a new SDK client
   *
   * @param options Client options
   *
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   * 
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   */
  constructor(options: ClientOptions) {
    if (!isObject(options)) {
      throw Error('`CogniteClient` is missing parameter `options`');
    }
    const { baseUrl } = options;
    this.instance = generateAxiosInstance(getBaseUrl(baseUrl), options.appId);
    addRetryToAxiosInstance(this.instance);

    this.metadataMap = new MetadataMap();
    this.loginApi = new LoginAPI(this.instance);
  }
  // tslint:disable-next-line:no-identical-functions
  public authenticate: () => Promise<boolean> = async () => {
    throw Error(
      'You can only call authenticate after you have called loginWithOAuth'
    );
  };

  /**
   * Login client with api-key
   *
   * @param options Login options
   *
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   * 
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   * client.loginWithApiKey({
   *   apiKey: '[API KEY]',
   *   project: '[PROJECT]',
   * });
   * // after login you can do calls with the client
   * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * ```
   */
  public loginWithApiKey = (options: ApiKeyLoginOptions) => {
    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!isObject(options)) {
      throw Error('`loginWithApiKey` is missing parameter `options`');
    }
    const { project, apiKey } = options;
    if (!isString(project) || !isString(apiKey)) {
      throw Error(
        'The properties `project` and `apiKey` must be provided to param `options` in `loginWithApiKey`'
      );
    }
    this.project = project;
    this.instance.defaults.headers['api-key'] = apiKey;

    this.initAPIs();
  };

  /**
   * Login client with OAuth login flow
   * <!-- [Login with redirect](https://doc.cognitedata.com/api/v1/#operation/redirectUrl) -->
   *
   * ```js
   * import { CogniteClient, REDIRECT } from '@cognite/sdk';
   * 
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   * 
   * client.loginWithOAuth({
   *   project: '[PROJECT]',
   *   onAuthenticate: REDIRECT // optional, REDIRECT is by default
   * });
   * // after login you can do calls with the client
   * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * ```
   *
   * @param options Login options
   */
  public loginWithOAuth = (options: OAuthLoginOptions) => {
    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!isObject(options)) {
      throw Error('`loginWithOAuth` is missing parameter `options`');
    }
    const { project } = options;
    if (!isString(project)) {
      throw Error(
        'The properties `project` must be provided to param `options` in `loginWithOAuth`'
      );
    }
    this.project = project;

    const onTokens = options.onTokens || (() => {});
    let onAuthenticate: OnAuthenticate = onAuthenticateWithRedirect;
    if (options.onAuthenticate === POPUP) {
      onAuthenticate = onAuthenticateWithPopup;
    } else if (isFunction(options.onAuthenticate)) {
      onAuthenticate = options.onAuthenticate;
    }
    const authenticate = createAuthenticateFunction({
      project,
      axiosInstance: this.instance,
      onAuthenticate,
      onTokens,
    });

    listenForNonSuccessStatusCode(this.instance, 401, async (error, retry) => {
      // ignore calls to /login/status
      const { config } = error;
      if (config.url === '/login/status') {
        return Promise.reject(error);
      }
      const didAuthenticate = await authenticate();
      return didAuthenticate ? retry() : Promise.reject(error);
    });

    this.initAPIs();
    this.authenticate = authenticate;
  };

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.instance.defaults.baseURL = baseUrl;
  };

  /**
   * Lookup response metadata from an request using the response as the parameter
   *
   * ```js
   * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * const metadata = client.getMetadata(createdAsset);
   * ```
   */
  public getMetadata = (value: any) => this.metadataMap.get(value);

  /**
   * Do plain get-requests using the client
   */
  public get = (path: string, options?: BaseRequestOptions) =>
    rawRequest(this.instance, { method: 'get', url: path, ...options }).then(
      responseTransformer
    );

  private initAPIs = () => {
    const defaultArgs: [string, AxiosInstance, MetadataMap] = [
      this.project,
      this.instance,
      this.metadataMap,
    ];
    this.assetsApi = new AssetsAPI(...defaultArgs);
    this.timeSeriesApi = new TimeSeriesAPI(...defaultArgs);
    this.dataPointsApi = new DataPointsAPI(...defaultArgs);
    this.eventsApi = new EventsAPI(...defaultArgs);
    this.filesApi = new FilesAPI(...defaultArgs);
    this.rawApi = new RawAPI(...defaultArgs);
    this.projectsApi = new ProjectsAPI(this.instance, this.metadataMap);
    this.groupsApi = new GroupsAPI(...defaultArgs);
    this.securityCategoriesApi = new SecurityCategoriesAPI(...defaultArgs);
    this.serviceAccountsApi = new ServiceAccountsAPI(...defaultArgs);
    this.models3DApi = new Models3DAPI(...defaultArgs);
    this.revisions3DApi = new Revisions3DAPI(...defaultArgs);
    this.files3DApi = new Files3DAPI(...defaultArgs);
    this.assetMappings3DApi = new AssetMappings3DAPI(...defaultArgs);
    this.viewer3DApi = new Viewer3DAPI(...defaultArgs);
    this.apiKeysApi = new ApiKeysAPI(...defaultArgs);
  };
}

function onAuthenticateWithRedirect(login: OnAuthenticateLoginObject) {
  login.redirect({
    redirectUrl: window.location.href,
  });
}

function onAuthenticateWithPopup(login: OnAuthenticateLoginObject) {
  login.popup({
    redirectUrl: window.location.href,
  });
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
