import {
  CDFHttpClient,
  HttpRequestOptions,
  MetadataMap,
  //  OnAuthenticateLoginObject,
} from '@cognite/sdk-core';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { WELL_SERVICE_BASE_URL, CDF_BASE_URL } from '../constants';
import { version } from '../../package.json';
import {
  ClientLoginOptions,
  ApiKeyLogin,
  TokenLogin,
  isUsingSSL,
  bearerTokenString,
} from './clientAuthUtils';
import { createRetryValidator } from '@cognite/sdk-core';
import { RetryableHttpClient } from '@cognite/sdk-core';
import { BasicRetryableHttpClient } from './httpClientWithRetry';
//import { RetryableHttpClient } from 'core/src/httpClient/retryableHttpClient';
//import { createAuthenticateFunction } from 'core/src/login';
//import { CDFHttpClient } from 'core/src/httpClient/cdfHttpClient';

export default class BaseWellsClient {
  private httpWells: BasicRetryableHttpClient;
  private httpCDF: CDFHttpClient;
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

    // Init the wells httpWells client
    this.httpWells = new BasicRetryableHttpClient(
      WELL_SERVICE_BASE_URL,
      createRetryValidator({}, 5)
    );
    this.wellsClient
      .setDefaultHeader('x-cdp-app', options.appId)
      .setDefaultHeader(
        'x-cdp-sdk',
        `CogniteWellsJavaScriptSDK:${this.version}`
      );

    // Init the CDF httpWells clientb
    this.httpCDF = new CDFHttpClient(CDF_BASE_URL, createRetryValidator({}, 5));

    this.cdfClient
      .setDefaultHeader('x-cdp-app', options.appId)
      .setDefaultHeader('x-cdp-sdk', `CogniteJavaScriptSDK:${this.version}`);

    this.metadata = new MetadataMap();
  }

  // For re-authenticating with CDF
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
    this.wellsClient.setDefaultHeader('api-key', apiKey);

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
        'You should use SSL (httpWellss) when you login with Token since CDF only allows redirecting back to an HTTPS site'
      );
    }

    // const onTokens = (() => { });
    // const onAuthenticate = authenticateWithRedirect;
    // const authenticate = createAuthenticateFunction({
    //   project,
    //   httpClient: this.cdfClient,
    //   onAuthenticate,
    //   onTokens,
    // });

    // this.wellsClient.set401ResponseHandler(async (_, retry, reject) => {
    //   const didAuthenticate = await authenticate();
    //   return didAuthenticate ? retry() : reject();
    // });

    const { accessToken } = options;
    if (accessToken) {
      this.wellsClient.setDefaultHeader(
        'Authorization',
        bearerTokenString(accessToken)
      );
    }

    if (!this.hasBeenLoggedIn) {
      this.initAPIs();
    }

    this.hasBeenLoggedIn = true;
  };

  /**
   * Basic HTTP method for GET
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public get = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.wellsClient.get<T>(path, options);

  /**
   * Basic HTTP method for PUT
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public put = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.wellsClient.put<T>(path, options);

  /**
   * Basic HTTP method for POST
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   */
  public post = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.wellsClient.post<T>(path, options);

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   */
  public delete = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.wellsClient.delete<T>(path, options);

  /**
   * Basic HTTP method for PATCH
   *
   * @param path The URL path
   * @param options Request options, optional
   */
  public patch = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.wellsClient.patch<T>(path, options);

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.wellsClient.setBaseUrl(baseUrl);
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
      httpWellsClient: RetryableHttpClient,
      map: MetadataMap
    ) => ApiType,
    relativePath: string
  ) => {
    return new api(
      `${WELL_SERVICE_BASE_URL}/${relativePath}`,
      this.wellsClient,
      this.metadataMap
    );
  };

  protected get metadataMap() {
    return this.metadata;
  }

  protected get wellsClient() {
    return this.httpWells;
  }

  protected get cdfClient() {
    return this.httpCDF;
  }
}

// function authenticateWithRedirect(login: OnAuthenticateLoginObject) {
//   login.redirect({
//     redirectUrl: window.location.href,
//   });
// }
