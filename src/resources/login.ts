// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { isString } from 'lodash';
import { parse, stringify } from 'query-string';
import { rawRequest, setBearerToken } from '../axiosWrappers';
import {
  getBaseUrl,
  isSameProject,
  promiseCache,
  removeParameterFromUrl,
} from '../utils';
import * as Login from './login';

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';
const LOGIN_IFRAME_NAME = 'cognite-js-sdk-auth-iframe';
const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';

export interface IdInfo {
  project: string;
  user: string;
}

export interface AuthorizeOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
}

/** @hidden */
export interface AuthorizeParams extends AuthorizeOptions {
  baseUrl: string;
  project: string;
  accessToken?: string;
}

/** @hidden */
export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

export type OnTokens = (tokens: AuthTokens) => void;
export interface OnAuthenticateLoginObject {
  redirect: (options: AuthorizeOptions) => void;
  popup: (options: AuthorizeOptions) => void;
  skip: () => void;
}
export type OnAuthenticate = (login: OnAuthenticateLoginObject) => void;

/** @hidden */
export function getIdInfoFromApiKey(
  axiosInstance: AxiosInstance,
  apiKey: string
): Promise<null | IdInfo> {
  return getIdInfo(axiosInstance, { 'api-key': apiKey });
}

/** @hidden */
export function getIdInfoFromAccessToken(
  axiosInstance: AxiosInstance,
  accessToken: string
): Promise<null | IdInfo> {
  return getIdInfo(axiosInstance, {
    Authorization: `Bearer ${accessToken}`,
  });
}

/** @hidden */
export interface AuthenticateParams {
  project: string;
  baseUrl: string;
}

/** @hidden */
export async function loginSilently(
  axiosInstance: AxiosInstance,
  params: AuthenticateParams
): Promise<null | AuthTokens> {
  if (isAuthIFrame()) {
    // don't resolve when inside iframe (we don't want to do any logic)
    return new Promise<null>(() => {});
  }

  const { project } = params;
  {
    const tokens = extractTokensFromUrl();
    if (
      tokens !== null &&
      (await isTokensValid(axiosInstance, project, tokens))
    ) {
      clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
      return tokens;
    }
  }

  const { baseUrl } = params;
  try {
    const href = window.location.href;
    const tokens = await silentLogin({
      baseUrl,
      project,
      redirectUrl: href,
      errorRedirectUrl: href,
    });
    if (tokens !== null) {
      return tokens;
    }
  } catch (_) {
    // don't do anything.
  }

  return null;
}

/** @hidden */
export async function getIdInfo(
  axiosInstance: AxiosInstance,
  headers: object
): Promise<null | IdInfo> {
  try {
    const response = await rawRequest<any>(axiosInstance, {
      method: 'get',
      url: '/login/status',
      headers,
    });
    const { loggedIn, user, project } = response.data.data;
    if (!loggedIn) {
      return null;
    }
    return {
      user,
      project,
    };
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

function clearParametersFromUrl(...params: string[]): void {
  let url = window.location.href;
  params.forEach(param => {
    url = removeParameterFromUrl(url, param);
  });
  window.history.replaceState(null, '', url);
}

function generateLoginUrl(params: AuthorizeParams): string {
  const { project, baseUrl, redirectUrl, errorRedirectUrl } = params;
  const queryParams = {
    project,
    redirectUrl,
    errorRedirectUrl: errorRedirectUrl || redirectUrl,
  };
  return `${baseUrl}/login/redirect?${stringify(queryParams)}`;
}

/** @hidden */
export function loginWithRedirect(params: AuthorizeParams): Promise<void> {
  return new Promise(() => {
    const url = generateLoginUrl(params);
    window.location.assign(url);
    // don't resolve promise since we do redirect
  });
}

interface CogniteParentWindow extends Window {
  postLoginTokens?: (tokens: null | AuthTokens) => void;
}

/** @hidden */
export function loginWithPopup(
  params: AuthorizeParams
): Promise<null | AuthTokens> {
  return new Promise((resolve, reject) => {
    const url = generateLoginUrl(params);
    const loginPopup = window.open(url, LOGIN_POPUP_NAME);
    if (loginPopup === null) {
      reject(new Error('Failed to create login popup window'));
      return;
    }
    const cogniteWindow: CogniteParentWindow = window;
    cogniteWindow.postLoginTokens = tokens => {
      delete cogniteWindow.postLoginTokens;
      resolve(tokens);
    };
  });
}

export function isLoginPopupWindow(): boolean {
  return window.name === LOGIN_POPUP_NAME;
}

export function loginPopupHandler() {
  if (!isLoginPopupWindow()) {
    throw Error(
      'loginPopupHandler can only be used inside a popup window created by the SDK. Please call isLoginPopupWindow to check for this'
    );
  }
  if (!(window.opener && window.opener.postLoginTokens)) {
    throw Error('Incorrect environment to run loginPopupHandler');
  }
  const tokens = parseTokenQueryParameters(window.location.search);
  window.opener.postLoginTokens(tokens);
  window.close();
}

function isAuthIFrame(): boolean {
  return window.name === LOGIN_IFRAME_NAME;
}

function parseTokenQueryParameters(query: string): null | AuthTokens {
  const {
    [ACCESS_TOKEN_PARAM]: accessToken,
    [ID_TOKEN_PARAM]: idToken,
    [ERROR_PARAM]: error,
    [ERROR_DESCRIPTION_PARAM]: errorDescription,
  } = parse(query);
  if (error !== undefined) {
    throw Error(`${error}: ${errorDescription}`);
  }
  if (isString(accessToken) && isString(idToken)) {
    return {
      accessToken,
      idToken,
    };
  }
  return null;
}

function extractTokensFromUrl() {
  let tokens;
  try {
    tokens = parseTokenQueryParameters(window.location.search);
    clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
    return tokens;
  } catch (err) {
    clearParametersFromUrl(ERROR_PARAM, ERROR_DESCRIPTION_PARAM);
    throw err;
  }
}

async function silentLogin(params: AuthorizeParams): Promise<AuthTokens> {
  return new Promise<AuthTokens>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.name = LOGIN_IFRAME_NAME;
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.border = 'none';
    iframe.onload = () => {
      try {
        const authTokens = parseTokenQueryParameters(
          iframe.contentWindow!.location.search
        );
        if (authTokens === null) {
          throw Error('Failed to login');
        }
        resolve(authTokens);
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(iframe);
      }
    };
    iframe.src = `${generateLoginUrl(params)}&prompt=none`;
    document.body.appendChild(iframe);
  });
}

/** @hidden */
export async function isTokensValid(
  axiosInstance: AxiosInstance,
  project: string,
  tokens: AuthTokens
) {
  const idInfo = await getIdInfoFromAccessToken(
    axiosInstance,
    tokens.accessToken
  );
  return idInfo !== null && isSameProject(idInfo.project, project);
}

interface CreateAuthFunctionOptions {
  project: string;
  axiosInstance: AxiosInstance;
  onTokens: OnTokens;
  onAuthenticate: OnAuthenticate;
}
/** @hidden */
export function createAuthenticateFunction(options: CreateAuthFunctionOptions) {
  const { project, axiosInstance, onTokens, onAuthenticate } = options;
  const baseUrl = getBaseUrl(axiosInstance.defaults.baseURL);
  return promiseCache(
    async (): Promise<boolean> => {
      const handleTokens = (tokens: AuthTokens) => {
        setBearerToken(axiosInstance, tokens.accessToken);
        if (onTokens) {
          onTokens(tokens);
        }
      };

      {
        const tokens = await Login.loginSilently(axiosInstance, {
          baseUrl,
          project,
        });
        if (tokens) {
          handleTokens(tokens);
          return true;
        }
      }

      return new Promise<boolean>((resolve, reject) => {
        const login: OnAuthenticateLoginObject = {
          skip: () => {
            resolve(false);
          },
          redirect: params => {
            const authorizeParams = {
              baseUrl,
              project,
              ...params,
            };
            Login.loginWithRedirect(authorizeParams).catch(reject);
          },
          popup: async params => {
            const authorizeParams = {
              baseUrl,
              project,
              ...params,
            };
            Login.loginWithPopup(authorizeParams)
              .then(tokens => {
                if (tokens) {
                  handleTokens(tokens);
                  resolve(true);
                }
                throw Error('Unable to login with popup');
              })
              .catch(reject);
          },
        };
        onAuthenticate(login);
      });
    }
  );
}
