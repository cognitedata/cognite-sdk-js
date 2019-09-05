// Copyright 2019 Cognite AS

import { isString } from 'lodash';
import { parse, stringify } from 'query-string';
import { API_KEY_HEADER, AUTHORIZATION_HEADER } from '../constants';
import { CogniteLoginError } from '../loginError';
import {
  bearerString,
  createInvisibleIframe,
  generatePopupWindow,
  getBaseUrl,
  isSameProject,
  promiseCache,
  removeQueryParameterFromUrl,
} from '../utils';
import { HttpHeaders } from '../utils/http/basicHttpClient';
import { CDFHttpClient } from '../utils/http/cdfHttpClient';
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
  httpClient: CDFHttpClient,
  apiKey: string
): Promise<null | IdInfo> {
  return getIdInfo(httpClient, { [API_KEY_HEADER]: apiKey });
}

/** @hidden */
export function getIdInfoFromAccessToken(
  httpClient: CDFHttpClient,
  accessToken: string
): Promise<null | IdInfo> {
  return getIdInfo(httpClient, {
    [AUTHORIZATION_HEADER]: bearerString(accessToken),
  });
}

/** @hidden */
export interface AuthenticateParams {
  project: string;
  baseUrl: string;
}

/** @hidden */
export async function loginSilently(
  httpClient: CDFHttpClient,
  params: AuthenticateParams
): Promise<null | AuthTokens> {
  if (isAuthIFrame()) {
    // don't resolve when inside iframe (we don't want to do any logic)
    return new Promise<null>(() => {});
  }

  const { project } = params;
  {
    const tokens = extractTokensFromUrl();
    if (tokens !== null && (await isTokensValid(httpClient, project, tokens))) {
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
  httpClient: CDFHttpClient,
  headers: HttpHeaders
): Promise<null | IdInfo> {
  try {
    const response = await httpClient.get<any>('/login/status', { headers });
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
    url = removeQueryParameterFromUrl(url, param);
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
  // @ts-ignore we want to return a promise which never gets resolved (window will redirect)
  return new Promise<void>(() => {
    const url = generateLoginUrl(params);
    window.location.assign(url);
  });
}

/** @hidden */
export function loginWithPopup(
  params: AuthorizeParams
): Promise<null | AuthTokens> {
  return new Promise((resolve, reject) => {
    const url = generateLoginUrl(params);
    const loginPopup = generatePopupWindow(url, LOGIN_POPUP_NAME);
    if (loginPopup === null) {
      reject(new CogniteLoginError('Failed to create login popup window'));
      return;
    }
    const tokenListener = (message: MessageEvent) => {
      if (message.source !== loginPopup) {
        return;
      }
      if (!message.data || message.data.error) {
        reject(new CogniteLoginError());
        return;
      }
      window.removeEventListener('message', tokenListener);
      resolve(message.data);
    };
    window.addEventListener('message', tokenListener, false);
  });
}

export function isLoginPopupWindow(): boolean {
  return window.name === LOGIN_POPUP_NAME;
}

export function loginPopupHandler() {
  if (!isLoginPopupWindow()) {
    return;
  }
  try {
    const tokens = parseTokenQueryParameters(window.location.search);
    window.opener.postMessage(tokens);
  } catch (err) {
    window.opener.postMessage({ error: err.message });
  } finally {
    window.close();
  }
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
  try {
    const tokens = parseTokenQueryParameters(window.location.search);
    clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
    return tokens;
  } catch (err) {
    clearParametersFromUrl(ERROR_PARAM, ERROR_DESCRIPTION_PARAM);
    throw err;
  }
}

async function silentLogin(params: AuthorizeParams): Promise<AuthTokens> {
  return new Promise<AuthTokens>((resolve, reject) => {
    const url = `${generateLoginUrl(params)}&prompt=none`;
    const iframe = createInvisibleIframe(url, LOGIN_IFRAME_NAME);
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
    document.body.appendChild(iframe);
  });
}

/** @hidden */
export async function isTokensValid(
  httpClient: CDFHttpClient,
  project: string,
  tokens: AuthTokens
) {
  const idInfo = await getIdInfoFromAccessToken(httpClient, tokens.accessToken);
  return idInfo !== null && isSameProject(idInfo.project, project);
}

interface CreateAuthFunctionOptions {
  project: string;
  httpClient: CDFHttpClient;
  onTokens: OnTokens;
  onAuthenticate: OnAuthenticate;
}
/** @hidden */
export function createAuthenticateFunction(options: CreateAuthFunctionOptions) {
  const { project, httpClient, onTokens, onAuthenticate } = options;
  const baseUrl = getBaseUrl(httpClient.getBaseUrl());
  return promiseCache(
    async (): Promise<boolean> => {
      const handleTokens = (tokens: AuthTokens) => {
        httpClient.setBearerToken(tokens.accessToken);
        if (onTokens) {
          onTokens(tokens);
        }
      };

      {
        const tokens = await Login.loginSilently(httpClient, {
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
                throw new CogniteLoginError();
              })
              .catch(reject);
          },
        };
        onAuthenticate(login);
      });
    }
  );
}
