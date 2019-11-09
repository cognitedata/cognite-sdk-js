// Copyright 2019 Cognite AS

import { isFunction, isObject, isString } from 'lodash';
import { version } from '../package.json';
import {
  API_KEY_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from './constants';
import { MetadataMap } from './metadata';
import { AssetMappings3DAPI } from './resources/3d/assetMappings3DApi';
import { Files3DAPI } from './resources/3d/files3DApi';
import { Models3DAPI } from './resources/3d/models3DApi';
import { Revisions3DAPI } from './resources/3d/revisions3DApi';
import { Viewer3DAPI } from './resources/3d/viewer3DApi';
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
import { LogoutApi } from './resources/logout/logoutApi';
import { ProjectsAPI } from './resources/projects/projectsApi';
import { RawAPI } from './resources/raw/rawApi';
import { SecurityCategoriesAPI } from './resources/securityCategories/securityCategoriesApi';
import { SequencesAPI } from './resources/sequences/sequencesApi';
import { ServiceAccountsAPI } from './resources/serviceAccounts/serviceAccountsApi';
import { TimeSeriesAPI } from './resources/timeSeries/timeSeriesApi';
import { apiUrl, getBaseUrl, isUsingSSL, projectUrl } from './utils';
import { HttpRequestOptions, HttpResponse } from './utils/http/basicHttpClient';
import { CDFHttpClient } from './utils/http/cdfHttpClient';

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
  /**
   * Provide optional cached access token to skip the authentication flow (client.authenticate will still override this).
   */
  accessToken?: string;
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
  public get sequences() {
    return validateAndReturnAPI(this.sequencesApi);
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
  public get logout() {
    return this.logoutApi;
  }

  private projectName: string = '';
  private httpClient: CDFHttpClient;
  private metadataMap: MetadataMap;
  private hasBeenLoggedIn: boolean = false;
  private assetsApi?: AssetsAPI;
  private timeSeriesApi?: TimeSeriesAPI;
  private dataPointsApi?: DataPointsAPI;
  private sequencesApi?: SequencesAPI;
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
  private logoutApi: LogoutApi;
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
    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }
    const { baseUrl } = options;
    this.httpClient = new CDFHttpClient(getBaseUrl(baseUrl));
    this.httpClient
      .setDefaultHeader(X_CDF_SDK_HEADER, `CogniteJavaScriptSDK:${version}`)
      .setDefaultHeader(X_CDF_APP_HEADER, options.appId);

    this.metadataMap = new MetadataMap();
    this.loginApi = new LoginAPI(this.httpClient, this.metadataMap);
    this.logoutApi = new LogoutApi(this.httpClient, this.metadataMap);
  }
  // tslint:disable-next-line:no-identical-functions
  public authenticate: () => Promise<boolean> = async () => {
    throw Error(
      'You can only call authenticate after you have called loginWithOAuth'
    );
  };

  public get project() {
    return this.projectName;
  }

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
    ['project', 'apiKey'].forEach(property => {
      // @ts-ignore
      if (!isString(options[property])) {
        throw Error(
          `options.${property} is required and must be of type string`
        );
      }
    });
    this.projectName = project;
    this.httpClient.setDefaultHeader(API_KEY_HEADER, apiKey);

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
   * (async () => {
   *   const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * })();
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
      throw Error('options.project is required and must be of type string');
    }
    this.projectName = project;

    if (!isUsingSSL()) {
      console.warn(
        'You should use SSL (https) when you login with OAuth since CDF only allows redirecting back to an HTTPS site'
      );
    }

    const onTokens = options.onTokens || (() => {});
    const onAuthenticate =
      options.onAuthenticate === POPUP
        ? onAuthenticateWithPopup
        : isFunction(options.onAuthenticate)
          ? options.onAuthenticate
          : onAuthenticateWithRedirect;

    const authenticate = createAuthenticateFunction({
      project,
      httpClient: this.httpClient,
      onAuthenticate,
      onTokens,
    });

    this.httpClient.set401ResponseHandler(async (_, retry, reject) => {
      const didAuthenticate = await authenticate();
      return didAuthenticate ? retry() : reject();
    });

    const { accessToken } = options;
    if (accessToken) {
      this.httpClient.setBearerToken(accessToken);
    }

    this.initAPIs();
    this.authenticate = authenticate;
  };

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.httpClient.setBaseUrl(baseUrl);
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
   * Basic HTTP method for GET
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const response = await client.get('/api/v1/projects/{project}/assets', { params: { limit: 50 }});
   * ```
   */
  public get = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.get<T>(path, options);

  /**
   * Basic HTTP method for PUT
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const response = await client.put('someUrl');
   * ```
   */
  public put = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.put<T>(path, options);

  /**
   * Basic HTTP method for POST
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
   * const response = await client.post('/api/v1/projects/{project}/assets', { data: { items: assets } });
   * ```
   */
  public post = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.post<T>(path, options);

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.delete('someUrl');
   * ```
   */
  public delete = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.delete<T>(path, options);

  public setOneTimeSdkHeader(value: string) {
    this.httpClient.addOneTimeHeader(X_CDF_SDK_HEADER, value);
  }

  private initAPIs = () => {
    const defaultArgs: [CDFHttpClient, MetadataMap] = [
      this.httpClient,
      this.metadataMap,
    ];
    const projectPath = projectUrl(this.project);
    const apiFactory = <ApiType>(
      api: new (
        relativePath: string,
        httpClient: CDFHttpClient,
        map: MetadataMap
      ) => ApiType,
      relativePath: string
    ) => {
      return new api(projectPath + relativePath, ...defaultArgs);
    };
    const models3DPath = '/3d/models';

    this.assetsApi = new AssetsAPI(
      this,
      projectPath + '/assets',
      ...defaultArgs
    );
    this.timeSeriesApi = new TimeSeriesAPI(
      this,
      projectPath + '/timeseries',
      ...defaultArgs
    );
    this.dataPointsApi = apiFactory(DataPointsAPI, '/timeseries/data');
    this.sequencesApi = apiFactory(SequencesAPI, '/sequences');
    this.eventsApi = apiFactory(EventsAPI, '/events');
    this.filesApi = apiFactory(FilesAPI, '/files');
    this.rawApi = apiFactory(RawAPI, '/raw/dbs');
    this.groupsApi = apiFactory(GroupsAPI, '/groups');
    this.securityCategoriesApi = apiFactory(
      SecurityCategoriesAPI,
      '/securitycategories'
    );
    this.serviceAccountsApi = apiFactory(
      ServiceAccountsAPI,
      '/serviceaccounts'
    );
    this.apiKeysApi = apiFactory(ApiKeysAPI, '/apikeys');
    this.models3DApi = apiFactory(Models3DAPI, models3DPath);
    this.revisions3DApi = apiFactory(Revisions3DAPI, models3DPath);
    this.files3DApi = apiFactory(Files3DAPI, '/3d/files');
    this.assetMappings3DApi = apiFactory(AssetMappings3DAPI, models3DPath);
    this.viewer3DApi = apiFactory(Viewer3DAPI, '/3d');
    this.projectsApi = new ProjectsAPI(apiUrl(), ...defaultArgs);
    this.loginApi = new LoginAPI(...defaultArgs);
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

export type BaseRequestOptions = HttpRequestOptions;
export type Response = HttpResponse<any>;
