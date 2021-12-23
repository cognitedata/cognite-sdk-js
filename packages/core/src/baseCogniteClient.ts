// Copyright 2020 Cognite AS

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
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

export interface ClientOptions {
  /** App identifier (ex: 'FileExtractor') */
  appId: string;
  /** URL to Cognite cluster, e.g 'https://greenfield.cognitedata.com' **/
  baseUrl?: string;
  project: string;
  getToken: () => Promise<string>;
  apiKeyMode?: boolean;
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
  private readonly apiKeyMode: boolean;
  /**
   * On 401 it might be possible to get a new token, but if `getToken` returns the same over and
   * over (e.g api-keys) there isn't a point retrying. previousToken is used to keep track of that,
   * comparing new tokens to one tried the last time.
   */
  private previousToken: string | undefined;
  private readonly getToken: () => Promise<string>;
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
    if (!isFunction(options.getToken)) {
      throw Error(
        'options.getToken is required and must be of type () => Promise<string>'
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
    this.apiKeyMode = !!options.apiKeyMode;
    this.getToken = async () => {
      return options.getToken();
    };

    this.httpClient.set401ResponseHandler(async (_, retry, reject) => {
      try {
        const newToken = await this.authenticate();
        if (newToken && newToken !== this.previousToken) {
          this.previousToken = newToken;
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
      const token = await this.getToken();
      if (this.apiKeyMode) {
        this.httpClient.setDefaultHeader(API_KEY_HEADER, token);
      } else {
        this.httpClient.setDefaultHeader(
          AUTHORIZATION_HEADER,
          bearerString(token)
        );
      }
      return token;
    } catch {
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
