import { MetadataMap, HttpError } from '@cognite/sdk-core';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import {
  AZURE_DEV_BASE_URL,
  BLUEFIELD_BASE_URL,
  BP_NORTHEUROPE_DEV_BASE_URL,
  COGDEV_BASE_URL,
} from '../constants';
import { version } from '../../package.json';
import {
  ClientLoginOptions,
  ApiKeyLogin,
  TokenLogin,
  isUsingSSL,
  bearerTokenString,
} from './clientAuthUtils';
import HttpClientWithIntercept from './httpClientWithIntercept';
import { Cluster } from './model/Cluster';

export default class BaseWellsClient {
  private http: HttpClientWithIntercept;
  private metadata: MetadataMap;
  private projectName: string = '';
  private hasBeenLoggedIn: boolean = false;

  constructor(options: ClientLoginOptions) {
    if (!isObject(options)) {
      throw Error('`CogniteWellsClient` is missing parameter `options`');
    }
    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }

    const baseUrl = this.baseUrl(options.cluster);

    this.http = new HttpClientWithIntercept(baseUrl);
    this.metadata = new MetadataMap();
  }

  public get project() {
    return this.projectName;
  }

  private baseUrl(cluster: Cluster) {
    if (cluster == Cluster.BLUEFIELD) {
      return BLUEFIELD_BASE_URL;
    } else if (cluster == Cluster.AZURE_DEV) {
      return AZURE_DEV_BASE_URL;
    } else if (cluster == Cluster.BP_NORTHEUROPE) {
      return BP_NORTHEUROPE_DEV_BASE_URL;
    } else {
      return COGDEV_BASE_URL;
    }
  }

  /**
   * Login client with api-key
   *
   * @param options Login options
   *
   */
  public loginWithApiKey = (options: ApiKeyLogin) => {
    if (this.hasBeenLoggedIn) {
      throw Error(
        'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite Wells client instance instead.'
      );
    }

    if (!isObject(options)) {
      throw Error('`loginWithApiKey` is missing parameter `options`');
    }
    const { project, apiKey } = options;
    const keys: (keyof ApiKeyLogin)[] = ['project', 'apiKey'];
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

  public loginWithToken = (options: TokenLogin) => {
    if (this.hasBeenLoggedIn) {
      throw Error(
        'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite Wells client instance instead.'
      );
    }

    if (!isObject(options)) {
      throw Error('`loginWithToken` is missing parameter `options`');
    }
    const { project } = options;
    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }
    this.projectName = project;

    if (!isUsingSSL()) {
      console.warn(
        'You should use SSL (https) when you login with Token since CDF only allows redirecting back to an HTTPS site'
      );
    }

    const { accessToken } = options;
    if (accessToken) {
      this.httpClient.setDefaultHeader(
        'Authorization',
        bearerTokenString(accessToken)
      );
    }

    this.initAPIs();
    this.hasBeenLoggedIn = true;
    this.httpClient.setIfUsingLoginToken = true;
    this.httpClient.setReauthenticateMethod = options.refreshToken;
  };

  public get getBaseUrl() {
    return this.httpClient.getBaseUrl();
  }

  public get isLoggedIn() {
    return this.hasBeenLoggedIn;
  }

  protected get version() {
    return `${version}-core`;
  }

  protected initAPIs() {
    // will be overritten by subclasses
  }

  protected apiFactory = <ApiType>(
    api: new (
      relativePath: string,
      httpClient: HttpClientWithIntercept,
      map: MetadataMap
    ) => ApiType,
    relativePath: string
  ) => {
    return new api(
      `${COGDEV_BASE_URL}/${relativePath}`,
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

export class ConfigureAPI {
  private _client?: HttpClientWithIntercept;
  protected project?: String;
  protected cluster?: String;

  public set setHttpClient(httpClient: HttpClientWithIntercept) {
    this._client = httpClient;
  }

  protected get client(): HttpClientWithIntercept {
    if (this._client === undefined) {
      throw new Error('Client is not defined');
    }
    return this._client;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
  }

  protected getPath(
    targetRoute: string,
    cursor?: string,
    limit?: number
  ): string {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }
    if (this.cluster == undefined) {
      throw new HttpError(400, 'No cluster has been set.', {});
    }

    const baseUrl = this.client.getBaseUrl();

    // URL constructor throws error if base url not included
    const path = new URL(`${baseUrl}/${this.project}${targetRoute}`);

    if (baseUrl == COGDEV_BASE_URL && this.cluster != Cluster.API) {
      path.searchParams.append(`env`, `${this.cluster}`);
    }

    if (cursor) {
      path.searchParams.append(`cursor`, `${cursor}`);
    }

    if (limit) {
      path.searchParams.append(`limit`, `${limit}`);
    }

    // we only need the route and params
    return path.toString().substring(baseUrl.length);
  }
}
