// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { isObject, isString } from 'lodash';
import {
  generateAxiosInstance,
  listenForNonSuccessStatusCode,
} from './axiosWrappers';
import { MetadataMap } from './metadata';
import { generateAPIObject } from './resources/api';
import {
  createAuthenticateFunction,
  getIdInfoFromApiKey,
  IdInfo,
  OnAuthenticate,
  OnTokens,
} from './resources/login';
import { addRetryToAxiosInstance } from './retryRequests';
import { getBaseUrl, isBrowser, isSameProject } from './utils';

export interface BaseOptions {
  /**
   * Specify Cognite API base url if it differs from `https://api.cognitedata.com`
   */
  baseUrl?: string;
  _axiosInstance?: AxiosInstance;
}

export interface ApiKeyLoginOptions extends BaseOptions {
  /**
   * A Cognite issued api-key
   */
  apiKey: string;
  /**
   * Cognite project
   */
  project: string;
}

export interface OAuthLoginOptions extends BaseOptions {
  /**
   * Cognite project to login into
   */
  project: string;
  onAuthenticate: OnAuthenticate;
  onTokens?: OnTokens;
}

/**
 * Create Cognite instance from API key
 *
 * @param options Instance options
 *
 * ```js
 * // create with async / await
 * const client = await createClientWithApiKey({
 *   apiKey: '[API KEY]',
 *   project: '[PROJECT]',
 * });
 * // do calls with the instance
 * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
 *
 * // create with .then
 * createClientWithApiKey({
 *   apiKey: '[API KEY]',
 *   project: '[PROJECT]',
 * }).then(client => {
 *   // do calls with the instance
 *   client.assets.create([{ name: 'My first asset' }]).then(createdAsset => {
 *     //
 *   });
 * });
 *
 * // also supports custom base url
 * createClientWithApiKey({
 *   ...
 *   baseUrl: 'https://greenfield.cognitedata.com',
 * });
 * ```
 */
export async function createClientWithApiKey(options: ApiKeyLoginOptions) {
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
      'The api key provided to `createClientWithApiKey` is not recognized by Cognite (invalid)'
    );
  }

  if (!isSameProject(project, apiKeyInfo.project)) {
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

export async function createClientWithOAuth(options: OAuthLoginOptions) {
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

  const onTokens = options.onTokens || (() => {});
  const authenticate = createAuthenticateFunction({
    project,
    axiosInstance,
    baseUrl,
    onAuthenticate: options.onAuthenticate,
    onTokens,
  });

  addRetryToAxiosInstance(axiosInstance);
  listenForNonSuccessStatusCode(axiosInstance, 401, async (error, retry) => {
    // ignore calls to /login/status
    const { config } = error;
    if (config.url === '/login/status') {
      return Promise.reject(error);
    }
    const didAuthenticate = await authenticate();
    return didAuthenticate ? retry() : Promise.reject(error);
  });

  return {
    ...generateAPIObject(project, axiosInstance, new MetadataMap()),
    authenticate,
  };
}

/**
 * Retrieve information from Cognite about an api-key
 *
 * @param apiKey The api-key to check
 * @param baseUrl - Base url for Cognite's API
 * @returns Information tied to the api-key
 *
 * ```js
 * const apiKeyInfo = await getApiKeyInfo('[API KEY]');
 *
 * // with with custom base url
 * const apiKeyInfo = await getApiKeyInfo('[API KEY]', 'https://greenfield.cognitedata.com');
 * ```
 */
export async function getApiKeyInfo(
  apiKey: string,
  baseUrl?: string,
  axiosInstance?: AxiosInstance
): Promise<null | IdInfo> {
  return getIdInfoFromApiKey(
    axiosInstance || generateAxiosInstance(getBaseUrl(baseUrl)),
    apiKey
  );
}

export { loginPopupHandler, isLoginPopupWindow } from './resources/login';
