// Copyright 2020 Cognite AS

import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { parse, stringify } from 'query-string';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import {
  bearerString,
  generatePopupWindow,
  isLocalhost,
  isSameProject,
  isUsingSSL,
  removeQueryParameterFromUrl,
} from './utils';
import { CogniteLoginError } from './loginError';
import { AUTHORIZATION_HEADER } from './constants';
import {
  HttpCall,
  HttpHeaders,
  HttpQueryParams,
} from './httpClient/basicHttpClient';
import { LogoutUrlResponse } from './types';

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';
const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';

export const REDIRECT = 'REDIRECT';
export const POPUP = 'POPUP';

export type OnTokens = (tokens: AuthTokens) => void;
export type OnAuthenticate = (login: OnAuthenticateLoginObject) => void;

export interface AuthOptions {
  project: string;
}

export interface LoginParams {
  baseUrl: string;
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
}

export interface IdInfo {
  projectId: number;
  project: string;
  user: string;
}

export interface AuthorizeOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
}

export interface OnAuthenticateLoginObject {
  redirect: (options: AuthorizeOptions) => void;
  popup: (options: AuthorizeOptions) => void;
  skip: () => void;
}

/** @hidden */
export interface AuthenticateParams {
  project: string;
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

/** @hidden */
export async function isTokensValid(
  httpClient: CDFHttpClient,
  project: string,
  tokens: AuthTokens
) {
  const idInfo = await getIdInfoFromAccessToken(httpClient, tokens.accessToken);
  return idInfo !== null && isSameProject(idInfo.project, project);
}

/** @hidden */
export function getIdInfoFromAccessToken(
  httpClient: CDFHttpClient,
  accessToken: string
): Promise<null | IdInfo> {
  return getIdInfo(httpClient.get.bind(httpClient), {
    [AUTHORIZATION_HEADER]: bearerString(accessToken),
  });
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

/** @hidden */
export async function getIdInfo(
  get: HttpCall,
  headers: HttpHeaders
): Promise<null | IdInfo> {
  try {
    const response = await get<any>('/login/status', { headers });
    const { loggedIn, user, project, projectId } = response.data.data;
    if (!loggedIn) {
      return null;
    }
    return {
      user,
      project,
      projectId,
    };
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

/** @hidden */
export async function getLogoutUrl(get: HttpCall, params: HttpQueryParams) {
  try {
    const response = await get<LogoutUrlResponse>('/logout/url', {
      params,
    });
    return response.data.data.url;
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

export class CogniteAuthentication {
  private readonly project: string;
  private accessToken?: string;
  private idToken?: string;

  constructor({ project }: AuthOptions) {
    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }

    this.project = project;
  }

  public login({
    onAuthenticate: onAuthMethod,
    baseUrl,
  }: LoginParams): Promise<AuthTokens | null> {
    const onAuthenticate =
      onAuthMethod === POPUP
        ? onAuthenticateWithPopup
        : isFunction(onAuthMethod)
          ? onAuthMethod
          : onAuthenticateWithRedirect;
    return new Promise((resolve, reject) => {
      const login: OnAuthenticateLoginObject = {
        skip: () => {
          resolve(null);
        },
        redirect: params => {
          const authorizeParams = {
            baseUrl,
            project: this.project,
            ...params,
          };
          loginWithRedirect(authorizeParams).catch(reject);
        },
        popup: async params => {
          const authorizeParams = {
            baseUrl,
            project: this.project,
            ...params,
          };
          try {
            const tokens = await loginWithPopup(authorizeParams);

            if (tokens) {
              this.setTokens(tokens);
              resolve(tokens);
            } else {
              reject(new CogniteLoginError());
            }
          } catch (error) {
            reject(error);
          }
        },
      };
      onAuthenticate(login);
    });
  }

  public async getCDFToken(httpClient: CDFHttpClient): Promise<string | null> {
    if (this.accessToken) {
      const isValid = await isTokensValid(httpClient, this.project, {
        accessToken: this.accessToken || '',
        idToken: this.idToken || '',
      });

      if (isValid) {
        return this.accessToken!;
      }
    }

    return null;
  }

  public async handleLoginRedirect(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | null> {
    if (!isUsingSSL() && !isLocalhost()) {
      return null;
    }

    const tokens = extractTokensFromUrl();

    if (
      tokens !== null &&
      (await isTokensValid(httpClient, this.project, tokens))
    ) {
      clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);

      return tokens;
    }

    return null;
  }

  private setTokens({ accessToken, idToken }: AuthTokens) {
    this.accessToken = accessToken;
    this.idToken = idToken;
  }
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

function onAuthenticateWithRedirect(login: OnAuthenticateLoginObject) {
  login.redirect({
    redirectUrl: window.location.href,
  });
}

function onAuthenticateWithPopup(login: OnAuthenticateLoginObject) {
  login.popup({
    redirectUrl: window.location.href,
  });
}
