// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { isObject, isString } from 'lodash';
import {
  generateAxiosInstance,
  listenForNonSuccessStatusCode,
  setBearerToken,
} from './axiosWrappers';
import { MetadataMap } from './metadata';
import { generateAPIObject } from './resources/api';
import {
  AuthTokens,
  getIdInfoFromApiKey,
  IdInfo,
  loginSilently,
  loginWithRedirect,
  RedirectOptions,
} from './resources/login';
import { addRetryToAxiosInstance } from './retryRequests';
import { getBaseUrl, isBrowser } from './utils';

export interface BaseOptions {
  /**
   * Specify CDP base url if it differs from `https://api.cognitedata.com`
   */
  baseUrl?: string;
  _axiosInstance?: AxiosInstance;
}

export interface ApiKeyLoginOptions extends BaseOptions {
  /**
   * A CDP issued api-key
   */
  apiKey: string;
  /**
   * CDP project
   */
  project: string;
}

export interface OAuthLoginOptions extends BaseOptions {
  /**
   * CDP project to login into
   */
  project: string;
  onAuthenticate: (
    login: {
      redirect: (options: RedirectOptions) => void;
      skip: () => void;
    }
  ) => void;
  onTokens?: (tokens: AuthTokens) => void;
}

/**
 * Class to create CDP-instances
 */
export class CDP {
  /**
   * Create CDP instance from API key
   *
   * @param options Instance options
   *
   * ```js
   * // create with async / await
   * const cdp = await CDP.createClientWithApiKey({
   *   apiKey: '[API KEY]',
   *   project: '[PROJECT]',
   * });
   * // do calls with the instance
   * const createdAsset = await cdp.assets.create([{ name: 'My first asset' }]);
   *
   * // create with .then
   * CDP.createClientWithApiKey({
   *   apiKey: '[API KEY]',
   *   project: '[PROJECT]',
   * }).then(cdp => {
   *   // do calls with the instance
   *   cdp.assets.create([{ name: 'My first asset' }]).then(createdAsset => {
   *     //
   *   });
   * });
   *
   * // also supports custom base url
   * CDP.createClientWithApiKey({
   *   ...
   *   baseUrl: 'https://greenfield.cognitedata.com',
   * });
   * ```
   */
  public static async createClientWithApiKey(options: ApiKeyLoginOptions) {
    if (!isObject(options)) {
      throw Error('`createClientWithApiKey` is missing parameter `options`');
    }
    const { project } = options;
    if (!isString(project)) {
      throw Error(
        'Property `project` not provided to param `options` in `createClientWithApiKey`'
      );
    }
    const { apiKey } = options;
    if (!isString(apiKey)) {
      throw Error(
        'Property `apiKey` not provided to param `options` in `createClientWithApiKey`'
      );
    }

    const { baseUrl, _axiosInstance } = options;
    const axiosInstance =
      _axiosInstance || generateAxiosInstance(getBaseUrl(baseUrl));
    addRetryToAxiosInstance(axiosInstance);

    const apiKeyInfo = await getIdInfoFromApiKey(axiosInstance, apiKey);
    if (apiKeyInfo === null) {
      throw Error(
        'The api key provided to `createClientWithApiKey` is not recognized by CDP (invalid)'
      );
    }

    const isSameProject =
      apiKeyInfo.project.toLowerCase() === project.toLowerCase();
    if (!isSameProject) {
      throw Error(
        `Projects didn't match. Api key is for project "${
          apiKeyInfo.project
        }" but you tried to login to "${project}"`
      );
    }

    axiosInstance.defaults.headers['api-key'] = apiKey;
    return generateAPIObject(
      apiKeyInfo.project,
      axiosInstance,
      new MetadataMap()
    );
  }

  public static async createClientWithOAuth(options: OAuthLoginOptions) {
    if (!isBrowser()) {
      throw Error(
        '`createClientWithOAuth` can only be used in a browser. For non-browser environments please use `createClientWithApiKey`'
      );
    }

    if (!isObject(options)) {
      throw Error('`createClientWithOAuth` is missing parameter `options`');
    }

    const { project } = options;
    if (!isString(project)) {
      throw Error(
        'Property `project` not provided to param `options` in `createClientWithOAuth`'
      );
    }

    const baseUrl = getBaseUrl(options.baseUrl);
    const axiosInstance =
      options._axiosInstance || generateAxiosInstance(baseUrl);

    const api = {
      ...generateAPIObject(project, axiosInstance, new MetadataMap()),
      authenticate: async (): Promise<boolean> => {
        const tokens = await loginSilently(axiosInstance, { baseUrl, project });
        if (tokens) {
          setBearerToken(axiosInstance, tokens.accessToken);
          if (options.onTokens) {
            options.onTokens(tokens);
          }
          return true;
        }

        return new Promise((resolve, reject) => {
          const login = {
            skip: () => {
              resolve(false);
            },
            redirect: (params: RedirectOptions) => {
              const authorizeParams = {
                baseUrl,
                project,
                ...params,
              };
              loginWithRedirect(authorizeParams).catch(reject);
            },
          };
          options.onAuthenticate(login);
        });
      },
    };

    addRetryToAxiosInstance(axiosInstance);
    listenForNonSuccessStatusCode(axiosInstance, 401, async (error, retry) => {
      // ignore calls to /login/status
      const config = error.config || {};
      if (config.url === '/login/status') {
        return Promise.reject(error);
      }
      const didAuthenticate = await api.authenticate();
      return didAuthenticate ? retry() : Promise.reject(error);
    });

    return api;
  }

  /**
   * Retrieve information from CDP about an api-key
   *
   * @param apiKey The api-key to check
   * @param baseUrl - Base url for CDP API
   * @returns Information tied to the api-key
   *
   * ```js
   * const apiKeyInfo = await CDP.getApiKeyInfo('[API KEY]');
   *
   * // with with custom base url
   * const apiKeyInfo = await CDP.getApiKeyInfo('[API KEY]', 'https://greenfield.cognitedata.com');
   * ```
   */
  public static async getApiKeyInfo(
    apiKey: string,
    baseUrl?: string,
    axiosInstance?: AxiosInstance
  ): Promise<null | IdInfo> {
    return getIdInfoFromApiKey(
      axiosInstance || generateAxiosInstance(getBaseUrl(baseUrl)),
      apiKey
    );
  }
}
