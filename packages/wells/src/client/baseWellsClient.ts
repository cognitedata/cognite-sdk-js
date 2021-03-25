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

    const base_url = this.baseUrl(options.cluster);

    this.http = new HttpClientWithIntercept(base_url);
    this.httpClient
      .setDefaultHeader('x-cdp-app', options.appId)
      .setDefaultHeader('x-cdp-sdk', `CogniteJavaScriptSDK:${this.version}`);

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

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.httpClient.setBaseUrl(baseUrl);
  };

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
  protected client?: HttpClientWithIntercept;
  protected project?: String;
  protected cluster?: String;

  public set setHttpClient(httpClient: HttpClientWithIntercept) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
  }

  protected getPath(baseUrl: string, cursor?: string): string {
    if (this.project == undefined) {
      throw new HttpError(400, 'The client project has not been set.', {});
    }
    if (this.cluster == undefined) {
      throw new HttpError(400, 'No cluster has been set.', {});
    }
    let path =
      this.cluster == Cluster.BLUEFIELD
        ? `/${this.project}${baseUrl}`
        : `/${this.project}${baseUrl}?env=${this.cluster}`;

    if (cursor) {
      path += `&cursor=${cursor}`;
    }
    return path;
  }
}
