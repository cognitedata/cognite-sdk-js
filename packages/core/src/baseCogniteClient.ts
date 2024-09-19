// Copyright 2020 Cognite AS

import isString from 'lodash/isString';
import { version } from '../package.json';
import {
  AUTHORIZATION_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from './constants';
import type { HttpResponse } from './httpClient/basicHttpClient';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import type { HttpHeaders } from './httpClient/httpHeaders';
import {
  type RetryValidator,
  createUniversalRetryValidator,
} from './httpClient/retryValidator';
import type { RetryableHttpRequestOptions } from './httpClient/retryableHttpClient';
import { MetadataMap } from './metadata';
import {
  type CogniteAPIVersion,
  bearerString,
  getBaseUrl,
  projectUrl,
} from './utils';
export interface ClientOptions {
  /**
   * App identifier (ex: 'FileExtractor')
   * This is a free-text string that will be used to identify your application.
   */
  appId: string;
  /** URL to Cognite cluster, e.g 'https://greenfield.cognitedata.com' **/
  baseUrl?: string;
  /** Project name */
  project: string;
  /**
   * @deprecated Use {@link oidcTokenProvider} instead.
   */
  getToken?: () => Promise<string>;
  /**
   * Will be invoked when the SDK needs to authenticate against the CDF API.
   * The function should return a valid access token to be used against the CDF API.
   * The function will be called when the API returns 401 (Unauthorized) or when
   * someone calls {@link BaseCogniteClient.authenticate}.
   *
   * It is the responsibility of the user to get hold of a valid access token to pass into the SDK.
   *
   * @returns A string representing the raw access token to be used against the CDF API.
   */
  oidcTokenProvider?: () => Promise<string>;
  /**
   * Used to override the default retry validator.
   */
  retryValidator?: RetryValidator;
}

export function accessApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error('API not found');
  }
  return api;
}
export default class BaseCogniteClient {
  readonly #apiVersion: CogniteAPIVersion;
  protected readonly httpClient: CDFHttpClient;
  protected readonly metadataMap: MetadataMap;
  readonly #getOidcToken: () => Promise<string | undefined>;
  readonly project: string;
  #retryValidator: RetryValidator;

  /**
   * To prevent calling `getToken` method multiple times in parallel, we set
   * the promise that `getToken` returns to a variable and check its existence
   * on function calls for `authenticate`.
   */
  #tokenPromise?: Promise<string | undefined>;
  #isTokenPromiseFulfilled?: boolean;
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
    if (!options) {
      throw Error('`CogniteClient` is missing parameter `options`');
    }

    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }

    if (!isString(options.project)) {
      throw Error('options.project is required and must be of type string');
    }

    if (options.getToken && options.oidcTokenProvider) {
      throw Error(
        'options.getToken and options.oidcTokenProvider are mutually exclusive. Please only provide options.oidcTokenProvider'
      );
    }

    if (!options.getToken && !options.oidcTokenProvider) {
      throw Error(
        'options.oidcTokenProvider is required and must be of type () => Promise<string>'
      );
    }

    if (options.getToken) {
      console.warn(
        'options.getToken is deprecated and has been renamed to `options.oidcTokenProvider`.'
      );
    }

    const { baseUrl } = options;

    this.#retryValidator =
      options.retryValidator ?? createUniversalRetryValidator();
    this.httpClient = this.#initializeCDFHttpClient(baseUrl, options);

    this.metadataMap = new MetadataMap();
    this.#apiVersion = apiVersion;
    this.project = options.project;
    this.#getOidcToken = async () => {
      if (options.oidcTokenProvider) {
        return options.oidcTokenProvider();
      }
      if (options.getToken) {
        return options.getToken();
      }
    };

    this.initAPIs();
  }

  public authenticate: () => Promise<string | undefined> = async () => {
    try {
      const token = await this.#authenticateUsingOidcTokenProvider();
      return token;
    } catch (e) {
      return;
    }
  };

  #authenticateUsingOidcTokenProvider: () => Promise<string | undefined> =
    async () => {
      try {
        if (!this.#tokenPromise || this.#isTokenPromiseFulfilled) {
          this.#isTokenPromiseFulfilled = false;
          this.#tokenPromise = this.#getOidcToken();
        }
        const token = await this.#tokenPromise;
        this.#isTokenPromiseFulfilled = true;

        if (token === undefined) return token;
        const bearer = bearerString(token);
        this.httpClient.setDefaultHeader(AUTHORIZATION_HEADER, bearer);
        return token;
      } catch {
        return;
      }
    };

  #initializeCDFHttpClient(
    baseUrl: string | undefined,
    options: ClientOptions
  ) {
    const httpClient = new CDFHttpClient(
      getBaseUrl(baseUrl),
      this.getRetryValidator()
    );

    httpClient
      .setDefaultHeader(X_CDF_APP_HEADER, options.appId)
      .setDefaultHeader(
        X_CDF_SDK_HEADER,
        `CogniteJavaScriptSDK:${this.version}`
      );

    httpClient.set401ResponseHandler(async (_, request, retry, reject) => {
      try {
        const requestToken = this.#retrieveTokenValueFromHeader(
          request.headers
        );
        const currentToken = await this.#tokenPromise;
        const newToken =
          currentToken !== requestToken
            ? currentToken
            : await this.authenticate();

        if (newToken && newToken !== requestToken) {
          retry();
        } else {
          reject();
        }
      } catch {
        reject();
      }
    });

    return httpClient;
  }

  /**
   * It retrieves the previous token from header
   * @returns string
   */
  #retrieveTokenValueFromHeader(headers?: HttpHeaders): string | undefined {
    const token = headers?.[AUTHORIZATION_HEADER];
    return token !== undefined ? token.replace('Bearer ', '') : token;
  }

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
  public getMetadata = (value: object) => this.metadataMap.get(value);

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
  public get = <T = unknown>(
    path: string,
    options?: RetryableHttpRequestOptions
  ) => this.httpClient.get<T>(path, options);

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
  public put = <T = unknown>(
    path: string,
    options?: RetryableHttpRequestOptions
  ) => this.httpClient.put<T>(path, options);

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
  public post = <T = unknown>(
    path: string,
    options?: RetryableHttpRequestOptions
  ) => this.httpClient.post<T>(path, options);

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.delete('someUrl');
   * ```
   */
  public delete = <T = unknown>(
    path: string,
    options?: RetryableHttpRequestOptions
  ) => this.httpClient.delete<T>(path, options);

  /**
   * Basic HTTP method for PATCH
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.patch('someUrl');
   * ```
   */
  public patch = <T = unknown>(
    path: string,
    options?: RetryableHttpRequestOptions
  ) => this.httpClient.patch<T>(path, options);

  protected initAPIs() {
    // will be overritten by subclasses
  }

  /**
   * Returns the retry validator to be used in the http client.
   * Override to provide a better validator
   */
  protected getRetryValidator(): RetryValidator {
    return this.#retryValidator;
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
    return projectUrl(this.project, this.#apiVersion);
  }
}

export type BaseRequestOptions = RetryableHttpRequestOptions;
export type Response = HttpResponse<unknown>;
