import {
  BasicHttpClient,
  HttpRequestOptions,
  MetadataMap,
} from '@cognite/sdk-core';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { WELL_SERVICE_BASE_URL } from '../constants';
import { version } from '../../package.json';

export interface ClientLoginOptions {
  appId: string;
  baseUrl?: string;
}

export interface CogniteProject {
  /**
   * Cognite project to login into
   */
  project: string;
}

export interface ApiLoginOptions extends CogniteProject {
  /**
   * A Cognite issued api-key
   */
  apiKey: string;
}

export function accessWellsApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithOAuth before you can use the Cognite Wells SDK'
    );
  }
  return api;
}

export default class BaseWellsClient {
  private http: BasicHttpClient;
  private metadata: MetadataMap;
  private projectName: string = '';
  private hasBeenLoggedIn: boolean = false;

  constructor(options: ClientLoginOptions) {
    if (!isObject(options)) {
      throw Error('`CogniteClient` is missing parameter `options`');
    }
    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }

    this.http = new BasicHttpClient(WELL_SERVICE_BASE_URL);
    this.httpClient
      .setDefaultHeader('x-cdp-app', options.appId)
      .setDefaultHeader('x-cdp-sdk', `CogniteJavaScriptSDK:${this.version}`);

    this.metadata = new MetadataMap();
  }

  public get project() {
    return this.projectName;
  }

  /**
   * Login client with api-key
   *
   * @param options Login options
   *
   */
  public loginWithApiKey = (options: ApiLoginOptions) => {
    if (this.hasBeenLoggedIn) {
      throw Error(
        'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite Wells client instance instead.'
      );
    }

    if (!isObject(options)) {
      throw Error('`loginWithApiKey` is missing parameter `options`');
    }
    const { project, apiKey } = options;
    const keys: (keyof ApiLoginOptions)[] = ['project', 'apiKey'];
    for (const property of keys) {
      if (!isString(options[property])) {
        throw Error(
          `options.${property} is required and must be of type string`
        );
      }
    }
    this.projectName = project;
    this.httpClient.setDefaultHeader('api-key', apiKey);

    this.initAPIs();
    this.hasBeenLoggedIn = true;
  };

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

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.httpClient.setBaseUrl(baseUrl);
  };

  protected get version() {
    return `${version}-core`;
  }

  protected initAPIs() {
    // will be overritten by subclasses
  }

  protected apiFactory = <ApiType>(
    api: new (
      relativePath: string,
      httpClient: BasicHttpClient,
      map: MetadataMap
    ) => ApiType,
    relativePath: string
  ) => {
    return new api(
      `${WELL_SERVICE_BASE_URL}/${relativePath}`,
      this.httpClient,
      this.metadataMap
    );
  };

  protected get metadataMap() {
    return this.metadata;
  }

  protected get httpClient() {
    return this.http;
  }
}
