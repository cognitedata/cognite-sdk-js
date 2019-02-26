// Copyright 2019 Cognite AS

import { isObject, isString } from 'lodash';
import { generateAxiosInstance } from './axiosWrappers';
import { MetadataMap } from './metadata';
import { generateAPIObject } from './resources/api';
import { ApiKeyInfo, getApiKeyInfo } from './resources/login';
import { isBrowser } from './utils';

export interface BaseOptions {
  /**
   * Specify CDP base url if it differs from `https://api.cognitedata.com`
   */
  baseUrl?: string;
}

export interface ApiKeyLoginOptions extends BaseOptions {
  /**
   * A CDP issued api-key
   */
  apiKey: string;
  /**
   * CDP project. If present and api-key don't match this project `createClientWithApiKey` will throw an exception
   */
  project?: string;
}

export interface OAuthLoginOptions extends BaseOptions {
  /**
   * CDP project to login into
   */
  project: string;
  /**
   * Where to redirect after successful login
   */
  redirectUrl?: string;
  /**
   * Where to redirect after failed login
   */
  errorRedirectUrl?: string;
  /**
   * If you pass in a valid accessToken it will use this token to avoid login prompt screen
   */
  accessToken?: string;
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
    const { apiKey, project } = options;
    const axiosInstance = generateAxiosInstance(options.baseUrl);

    if (!isString(apiKey)) {
      throw Error(
        'Property `apiKey` not provided to param `options` in `createClientWithApiKey`'
      );
    }
    const apiKeyInfo = await getApiKeyInfo(axiosInstance, apiKey);
    if (apiKeyInfo === null) {
      throw Error(
        'The api key provided to `createClientWithApiKey` is not recognized by CDP (invalid)'
      );
    }

    const isSameProject =
      apiKeyInfo.project.toLowerCase() === (project || '').toLowerCase();
    if (isString(project) && !isSameProject) {
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
    baseUrl?: string
  ): Promise<null | ApiKeyInfo> {
    const axiosInstance = generateAxiosInstance(baseUrl);
    return getApiKeyInfo(axiosInstance, apiKey);
  }
}
