// Copyright 2020 Cognite AS

import noop from 'lodash/noop';
import isString from 'lodash/isString';
import { parse, stringify } from 'query-string';
import isFunction from 'lodash/isFunction';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import {
  AuthorizeParams,
  AuthTokens,
  getIdInfo,
  IdInfo,
  OnAuthenticateLoginObject,
} from './login';
import {
  bearerString,
  createInvisibleIframe,
  generatePopupWindow,
  getBaseUrl,
  isLocalhost,
  isSameProject,
  isUsingSSL,
  removeQueryParameterFromUrl,
} from './utils';
import { POPUP } from './baseCogniteClient';
import { CogniteLoginError } from './loginError';
import { AUTHORIZATION_HEADER } from './constants';

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';
const LOGIN_IFRAME_NAME = 'cognite-js-sdk-auth-iframe';
const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';

export interface AuthOptions {
  project: string;
}

export interface LoginParams {
  baseUrl: string;
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
}

export type OnAuthenticate = (login: OnAuthenticateLoginObject) => void;

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

    const tokens = await this.acquireTokens(httpClient);

    return tokens ? tokens.accessToken : null;
  }

  public async acquireTokens(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | null> {
    if (!isUsingSSL() && !isLocalhost()) {
      return null;
    }

    let tokens = (await this.handleLoginRedirect(httpClient)) || null;

    if (!tokens) {
      tokens = await this.acquireTokensSilently(httpClient);
    }

    if (tokens) {
      this.setTokens(tokens);

      return tokens;
    }

    return null;
  }

  private async handleLoginRedirect(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | void> {
    const tokens = extractTokensFromUrl();

    if (
      tokens !== null &&
      (await isTokensValid(httpClient, this.project, tokens))
    ) {
      clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);

      return tokens;
    }
  }

  private async acquireTokensSilently(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | null> {
    if (isAuthIFrame()) {
      // don't resolve when inside iframe (we don't want to do any logic)
      return new Promise<null>(noop);
    }

    const baseUrl = getBaseUrl(httpClient.getBaseUrl());

    try {
      const href = window.location.href;
      const tokens = await silentLoginViaIFrame({
        baseUrl,
        project: this.project,
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

  private setTokens({ accessToken, idToken }: AuthTokens) {
    this.accessToken = accessToken;
    this.idToken = idToken;
  }
}

function silentLoginViaIFrame(params: AuthorizeParams): Promise<AuthTokens> {
  return new Promise<AuthTokens>((resolve, reject) => {
    const url = `${generateLoginUrl(params)}&prompt=none`;
    const iframe = createInvisibleIframe(url, LOGIN_IFRAME_NAME);
    iframe.onload = () => {
      try {
        const authTokens = parseTokenQueryParameters(
          iframe.contentWindow!.location.search
        );
        console.log(iframe.contentWindow!.location.search);
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

function isAuthIFrame(): boolean {
  return window.name === LOGIN_IFRAME_NAME;
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
