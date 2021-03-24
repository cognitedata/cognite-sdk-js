// Copyright 2020 Cognite AS

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { LoginAPI } from './api/login/loginApi';
import { LogoutApi } from './api/logout/logoutApi';
import {
  API_KEY_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from './constants';
import {
  HttpHeaders,
  HttpRequestOptions,
  HttpResponse,
} from './httpClient/basicHttpClient';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import { MetadataMap } from './metadata';
import {
  getBaseUrl,
  isOAuthWithAADOptions,
  isOAuthWithCogniteOptions,
  isUsingSSL,
  projectUrl,
} from './utils';
import { version } from '../package.json';
import {
  createUniversalRetryValidator,
  RetryValidator,
} from './httpClient/retryValidator';
import { AzureAD, AzureADSingInType } from './aad';
import { CogniteAuthentication, OnAuthenticate, OnTokens } from './auth';

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

export const AAD_OAUTH = 'AAD_OAUTH';
export const CDF_OAUTH = 'CDF_OAUTH';
export type AuthFlowType = typeof AAD_OAUTH | typeof CDF_OAUTH;

export interface OAuthLoginForCogniteOptions {
  project: string;
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
  onTokens?: OnTokens;
  /**
   * Provide optional cached access token to skip the authentication flow (client.authenticate will still override this).
   */
  accessToken?: string;
}

export interface OAuthLoginForAADOptions {
  cluster: string;
  clientId: string;
  tenantId?: string;
  signInType?: AzureADSingInType;
  debug?: boolean;
}

export type OAuthLoginOptions =
  | OAuthLoginForCogniteOptions
  | OAuthLoginForAADOptions;

export function accessApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithOAuth before you can use the Cognite SDK'
    );
  }
  return api;
}

export function throwReLogginError() {
  throw Error(
    'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite client instance instead.'
  );
}

type OAuthLoginResult = [() => Promise<boolean>, (string | null)];

export default class BaseCogniteClient {
  public get login() {
    return this.loginApi;
  }
  public get logout() {
    return this.logoutApi;
  }

  private readonly http: CDFHttpClient;
  private readonly metadata: MetadataMap;
  private readonly loginApi: LoginAPI;
  private readonly logoutApi: LogoutApi;
  private projectName: string = '';
  private hasBeenLoggedIn: boolean = false;
  private azureAdClient?: AzureAD;
  private cogniteAuthClient?: CogniteAuthentication;
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
  }

  public authenticate: () => Promise<boolean> = async () => {
    throw Error(
      'You can only call authenticate after you have called loginWithOAuth'
    );
  };

  public setProject(projectName: string) {
    this.projectName = projectName;
    this.initAPIs();
  }

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
    const keys: (keyof ApiKeyLoginOptions)[] = ['project', 'apiKey'];
    for (const property of keys) {
      if (!isString(options[property])) {
        throw Error(
          `options.${property} is required and must be of type string`
        );
      }
    }
    this.httpClient.setDefaultHeader(API_KEY_HEADER, apiKey);

    this.setProject(project);
    this.hasBeenLoggedIn = true;
  };

  /**
   * Sign in client with OAuth login flow
   * <!-- [Login with redirect](https://doc.cognitedata.com/api/v1/#operation/redirectUrl) -->
   *
   * ```js
   * import { CogniteClient, REDIRECT } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   *
   * // using Cognite authentication flow
   * client.loginWithOAuth({
   *   project: '[PROJECT]',
   *   onAuthenticate: REDIRECT // optional, REDIRECT is by default
   * });
   *
   * // or you can sign in using AzureAD authentication flow (in case your projects supports it)
   * client.loginWithOAuth({
   *   cluster: '[CLUSTER]',
   *   clientId: '[CLIENT_ID]', // client id of your AzureAD application
   *   tenantId: '[TENANT_ID]', // tenant id of your AzureAD tenant. Will be set to 'common' if not provided
   * });
   * // after sign in you can do calls with the client
   * (async () => {
   *   await client.authenticate();
   *   client.setProject('project-name');
   *   const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * })();
   * ```
   *
   * @param options Login options
   */
  public loginWithOAuth = async (
    options: OAuthLoginOptions
  ): Promise<boolean> => {
    let token = null;

    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!options) {
      throw Error('`loginWithOAuth` is missing parameter `options`');
    }

    if (!isUsingSSL()) {
      console.warn(
        'You should use SSL (https) when you login with OAuth since CDF only allows redirecting back to an HTTPS site'
      );
    }

    let authenticate: () => Promise<boolean>;

    if (isOAuthWithCogniteOptions(options)) {
      [authenticate, token] = await this.loginWithCognite(options);
    } else if (isOAuthWithAADOptions(options)) {
      [authenticate, token] = await this.loginWithAAD(options);
    } else {
      throw Error('`loginWithOAuth` is missing correct `options` structure');
    }

    this.httpClient.set401ResponseHandler(async (_, retry, reject) => {
      const didAuthenticate = await authenticate();
      return didAuthenticate ? retry() : reject();
    });

    if (token) {
      this.httpClient.setBearerToken(token);
    }

    this.authenticate = authenticate;
    this.hasBeenLoggedIn = true;

    return token !== null;
  };

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    if (this.azureAdClient) {
      throw Error('`setBaseUrl` does not available with Azure AD auth flow');
    }
    this.httpClient.setBaseUrl(baseUrl);
  };

  /**
   * Returns the base-url used for all requests.
   */
  public getBaseUrl(): string {
    return this.httpClient.getBaseUrl();
  }

  /**
   * Provides information about which OAuth flow has been used
   */
  public getOAuthFlowType(): AuthFlowType | undefined {
    return this.azureAdClient
      ? AAD_OAUTH
      : this.cogniteAuthClient
        ? CDF_OAUTH
        : undefined;
  }

  /**
   * Returns CDF token in case of AzureAD authentication flow usage.
   * This token can be used to CDF endpoints
   *
   * ```js
   * client.loginWithOAuth({cluster: 'bluefield', ...});
   * await client.authenticate();
   * const cdfToken = await client.getCDFToken();
   * ```
   */
  public async getCDFToken(): Promise<string | null> {
    if (this.azureAdClient) {
      return this.azureAdClient.getCDFToken();
    } else if (this.cogniteAuthClient) {
      const tokens = await this.cogniteAuthClient.getCDFToken(this.httpClient);

      return tokens ? tokens.accessToken : null;
    } else {
      throw Error('CDF token can be acquired only using loginWithOAuth flow');
    }
  }

  /**
   * Returns Azure AD access token in case of AzureAD authentication flow usage.
   * Can be used for getting user details via Microsoft Graph API
   *
   * ```js
   * client.loginWithOAuth({cluster: 'bluefield', ...});
   * await client.authenticate();
   * const accessToken = await client.getAzureADAccessToken();
   * ```
   */
  public getAzureADAccessToken(): Promise<string | null> {
    if (!this.azureAdClient) {
      throw Error(
        'Azure AD access token can be acquired only using AzureAD auth flow'
      );
    }

    return this.azureAdClient.getAccountToken();
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

  public setOneTimeSdkHeader(value: string) {
    this.httpClient.addOneTimeHeader(X_CDF_SDK_HEADER, value);
  }

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
    return projectUrl(this.project);
  }

  protected get metadataMap() {
    return this.metadata;
  }

  protected get httpClient() {
    return this.http;
  }

  protected loginWithAAD = async ({
    cluster,
    clientId,
    tenantId,
    signInType,
    debug,
  }: OAuthLoginForAADOptions): Promise<OAuthLoginResult> => {
    const config = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: `${window.location.origin}`,
        navigateToLoginRequestUrl: true,
      },
    };

    const azureAdClient = new AzureAD({ config, cluster, debug });

    this.httpClient.setCluster(azureAdClient.getCluster());

    const token = await this.handleAzureADLoginRedirect(azureAdClient);
    const authenticate = async () => {
      let cdfAccessToken;

      try {
        cdfAccessToken = await azureAdClient.getCDFToken();
      } catch {
        noop();
      }

      if (!cdfAccessToken) {
        await azureAdClient.login(signInType);

        cdfAccessToken = await azureAdClient.getCDFToken();

        if (!cdfAccessToken) {
          return false;
        }
      }

      this.httpClient.setBearerToken(cdfAccessToken);

      return true;
    };

    this.azureAdClient = azureAdClient;

    return [authenticate, token];
  };

  protected loginWithCognite = async ({
    project,
    accessToken,
    onTokens = noop,
    onAuthenticate,
  }: OAuthLoginForCogniteOptions): Promise<OAuthLoginResult> => {
    let token: string | null = null;

    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }

    if (accessToken) {
      this.httpClient.setBearerToken(accessToken);
    }

    const cogniteAuthClient = new CogniteAuthentication({ project });
    const authTokens = await cogniteAuthClient.handleLoginRedirect(
      this.httpClient
    );

    if (authTokens) {
      token = authTokens.accessToken;
    }

    if (authTokens && onTokens) {
      onTokens(authTokens);
    }

    this.setProject(project);

    const authenticate = async () => {
      let authTokens = await cogniteAuthClient.getCDFToken(this.httpClient);

      if (!authTokens) {
        const baseUrl = getBaseUrl(this.httpClient.getBaseUrl());

        authTokens = await cogniteAuthClient.login({
          baseUrl,
          onAuthenticate,
        });
      }

      if (!authTokens) {
        return false;
      }

      this.httpClient.setBearerToken(authTokens.accessToken);

      if (onTokens) {
        onTokens(authTokens);
      }

      return true;
    };

    this.cogniteAuthClient = cogniteAuthClient;

    return [authenticate, token];
  };

  protected async handleAzureADLoginRedirect(
    azureAdClient: AzureAD
  ): Promise<string | null> {
    const account = await azureAdClient.initAuth();
    let token: string | null = null;

    if (!account) return null;

    try {
      token = await azureAdClient.getCDFToken();
    } catch {
      noop();
    }

    return token;
  }
}

export type BaseRequestOptions = HttpRequestOptions;
export type Response = HttpResponse<any>;
