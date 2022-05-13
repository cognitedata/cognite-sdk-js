// Copyright 2020 Cognite AS

import {
  ClientCredentialsAuth,
  DeviceAuth,
  ImplicitAuth,
  PkceAuth,
} from '@cognitedata/auth-wrapper';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { LoginAPI } from './api/login/loginApi';
import { LogoutApi } from './api/logout/logoutApi';
import {
  AUTHORIZATION_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
  API_KEY_HEADER,
} from './constants';
import { HttpRequestOptions, HttpResponse } from './httpClient/basicHttpClient';
import { HttpHeaders } from './httpClient/httpHeaders';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import { MetadataMap } from './metadata';
import {
  bearerString,
  getBaseUrl,
  isUsingSSL,
  projectUrl,
  isBrowser,
  CogniteAPIVersion,
} from './utils';
import { version } from '../package.json';
import {
  createUniversalRetryValidator,
  RetryValidator,
} from './httpClient/retryValidator';

export interface ClientCredentials {
  method: 'api' | 'client_credentials' | 'device' | 'implicit' | 'pkce';
  apiKey?: string;
  authority?: string;
  client_id?: string;
  client_secret?: string;
  response_type?: string;
  grant_type?: string;
  scope?: string;
}

export interface TokenCredentials {
  token_type: string;
  expires_in: string;
  ext_expires_in: string;
  expires_on?: string;
  not_before?: string;
  resource?: string;
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  expires_at?: number;
  session_state?: string;
}

export interface ClientOptions {
  /** App identifier (ex: 'FileExtractor') */
  appId: string;
  /** URL to Cognite cluster, e.g 'https://greenfield.cognitedata.com' **/
  baseUrl?: string;
  project: string;
  credentials: ClientCredentials;
}

export function accessApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error('API not found');
  }
  return api;
}
export default class BaseCogniteClient {
  /**
   * @deprecated
   */
  public get login() {
    return this.loginApi;
  }

  /**
   * @deprecated
   */
  public get logout() {
    return this.logoutApi;
  }

  private readonly apiVersion: CogniteAPIVersion;
  private readonly http: CDFHttpClient;
  private readonly metadata: MetadataMap;
  private readonly loginApi: LoginAPI;
  private readonly logoutApi: LogoutApi;
  /**
   * On 401 it might be possible to get a new token, but if `getToken` returns the same over and
   * over (e.g api-keys) there isn't a point retrying. previousToken is used to keep track of that,
   * comparing new tokens to one tried the last time.
   */
  private credentials: ClientCredentials;
  private tokenCredentials: TokenCredentials = {} as TokenCredentials;
  readonly project: string;

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
  constructor(options: ClientOptions, apiVersion: CogniteAPIVersion = 'v1') {
    if (!isObject(options)) {
      throw Error('`CogniteClient` is missing parameter `options`');
    }
    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }
    if (!isString(options.project)) {
      throw Error('options.project is required and must be of type string');
    }
    if (!options.credentials) {
      throw Error('options.credentials is required');
    }
    if (!options.credentials.method) {
      throw Error(
        'options.credentials.method is required and must be of type string with one of this values: api, client_credentials, device, implicit, pkce'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'api' &&
      !options.credentials.apiKey
    ) {
      throw Error(
        'options.credentials.apiKey is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'client_credentials' &&
      !options.credentials.authority
    ) {
      throw Error(
        'options.credentials.authority is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'client_credentials' &&
      !options.credentials.client_id
    ) {
      throw Error(
        'options.credentials.client_id is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'client_credentials' &&
      !options.credentials.client_secret
    ) {
      throw Error(
        'options.credentials.client_secret is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'client_credentials' &&
      !options.credentials.scope
    ) {
      throw Error(
        'options.credentials.scope is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'client_credentials' &&
      !options.credentials.grant_type
    ) {
      throw Error(
        'options.credentials.grant_type is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'device' &&
      !options.credentials.authority
    ) {
      throw Error(
        'options.credentials.authority is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'device' &&
      !options.credentials.client_id
    ) {
      throw Error(
        'options.credentials.client_id is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'device' &&
      !options.credentials.client_secret
    ) {
      throw Error(
        'options.credentials.client_secret is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'device' &&
      !options.credentials.scope
    ) {
      throw Error(
        'options.credentials.scope is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'implicit' &&
      !options.credentials.authority
    ) {
      throw Error(
        'options.credentials.authority is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'implicit' &&
      !options.credentials.client_id
    ) {
      throw Error(
        'options.credentials.client_id is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'implicit' &&
      !options.credentials.client_secret
    ) {
      throw Error(
        'options.credentials.client_secret is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'implicit' &&
      !options.credentials.scope
    ) {
      throw Error(
        'options.credentials.scope is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'implicit' &&
      !options.credentials.grant_type
    ) {
      throw Error(
        'options.credentials.grant_type is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'pkce' &&
      !options.credentials.authority
    ) {
      throw Error(
        'options.credentials.authority is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'pkce' &&
      !options.credentials.client_id
    ) {
      throw Error(
        'options.credentials.client_id is required and must be of type string'
      );
    }
    if (
      options.credentials.method &&
      options.credentials.method === 'pkce' &&
      !options.credentials.scope
    ) {
      throw Error(
        'options.credentials.scope is required and must be of type string'
      );
    }
    if (isBrowser() && !isUsingSSL()) {
      console.warn(
        'You should use SSL (https) when you login with OAuth since CDF only allows redirecting back to an HTTPS site'
      );
    }

    const { baseUrl } = options;

    this.http = new CDFHttpClient(
      getBaseUrl(baseUrl),
      this.getRetryValidator()
    );
    this.httpClient
      .setDefaultHeader(X_CDF_APP_HEADER, options.appId)
      .setDefaultHeader(
        X_CDF_SDK_HEADER,
        `CogniteJavaScriptSDK:${this.version}`
      );

    this.metadata = new MetadataMap();
    this.loginApi = new LoginAPI(this.httpClient, this.metadataMap);
    this.logoutApi = new LogoutApi(this.httpClient, this.metadataMap);
    this.apiVersion = apiVersion;
    this.project = options.project;
    this.credentials = options.credentials;

    this.httpClient.set401ResponseHandler(async (_, retry, reject) => {
      try {
        const newToken = await this.authenticate();
        if (newToken && newToken !== _.headers[API_KEY_HEADER]) {
          retry();
        } else {
          reject();
        }
      } catch {
        reject();
      }
    });

    this.initAPIs();
  }

  public authenticate: () => Promise<string | undefined> = async () => {
    try {
      if (!this.credentials) return;

      if (this.credentials.method === 'api') {
        const token: string = this.credentials.apiKey!;
        this.httpClient.setDefaultHeader(API_KEY_HEADER, token);

        return token;
      }

      if (this.tokenCredentials.refresh_token) {
        this.tokenCredentials.access_token = '';
      }

      if (this.credentials.method === 'client_credentials') {
        // @ts-ignore
        this.tokenCredentials = await ClientCredentialsAuth.load(
          // @ts-ignore
          this.credentials
        ).login();
      }

      if (this.credentials.method === 'device') {
        // @ts-ignore
        this.tokenCredentials = await DeviceAuth.load(this.credentials).login(
          this.tokenCredentials.refresh_token
        );
      }

      if (this.credentials.method === 'implicit') {
        // @ts-ignore
        this.tokenCredentials = await ImplicitAuth.load(
          // @ts-ignore
          this.credentials
        ).login();
      }

      if (this.credentials.method === 'pkce') {
        // @ts-ignore
        this.tokenCredentials = await PkceAuth.load(this.credentials).login(
          this.tokenCredentials.refresh_token
        );
      }

      if (
        this.tokenCredentials.access_token !== undefined &&
        this.tokenCredentials.access_token !== ''
      ) {
        this.httpClient.setDefaultHeader(
          AUTHORIZATION_HEADER,
          bearerString(this.tokenCredentials.access_token)
        );
      }

      console.log('mmmmm', this.tokenCredentials);
      return this.tokenCredentials.access_token!;
    } catch (e) {
      return;
    }
  };

  /**
   * Returns the base-url used for all requests.
   */
  public getBaseUrl(): string {
    return this.httpClient.getBaseUrl();
  }

  /**
   * Returns the default HTTP request headers, including e.g. authentication
   * headers that is included in all requests. Headers provided per-requests is not
   * included in this list. This function is useful when constructing API requests
   * outside the SDK.
   *
   * ```js
   * const customUrl = '...';
   * const headers = client.getDefaultRequestHeaders();
   * const result = await fetch(customUrl, { headers });
   * ```
   */
  public getDefaultRequestHeaders(): HttpHeaders {
    return { ...this.httpClient.getDefaultHeaders() };
  }

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

  /**
   * Basic HTTP method for PATCH
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.patch('someUrl');
   * ```
   */
  public patch = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.patch<T>(path, options);

  protected initAPIs() {
    // will be overritten by subclasses
  }

  /**
   * Returns the retry validator to be used in the http client.
   * Override to provide a better validator
   */
  protected getRetryValidator(): RetryValidator {
    return createUniversalRetryValidator();
  }

  protected get version() {
    return `${version}-core`;
  }

  protected apiFactory = <ApiType>(
    api: new (
      relativePath: string,
      httpClient: CDFHttpClient,
      map: MetadataMap
    ) => ApiType,
    relativePath: string
  ) => {
    return new api(
      `${this.projectUrl}/${relativePath}`,
      this.httpClient,
      this.metadataMap
    );
  };

  protected get projectUrl() {
    return projectUrl(this.project, this.apiVersion);
  }

  protected get metadataMap() {
    return this.metadata;
  }

  protected get httpClient() {
    return this.http;
  }
}

export type BaseRequestOptions = HttpRequestOptions;
export type Response = HttpResponse<any>;
