import { MetadataMap } from '@cognite/sdk-core';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { WELL_SERVICE_BASE_URL } from '../constants';
import { version } from '../../package.json';
import {
  ClientLoginOptions,
  ApiKeyLogin,
  TokenLogin,
  isUsingSSL,
  bearerTokenString,
} from './clientAuthUtils';
import HttpClientWithIntercept from './httpClientWithIntercept';

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

    this.http = new HttpClientWithIntercept(WELL_SERVICE_BASE_URL);
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

    if (!this.hasBeenLoggedIn) {
      this.initAPIs();
    }

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
