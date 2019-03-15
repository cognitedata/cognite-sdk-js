// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { isString } from 'lodash';
import { parse, stringify } from 'query-string';
import { rawGet } from '../axiosWrappers';
import { removeParameterFromUrl } from '../utils';

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

export interface RedirectOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
}

/** @hidden */
export interface AuthorizeParams extends RedirectOptions {
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
    return new Promise(() => {});
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

async function getIdInfo(
  axiosInstance: AxiosInstance,
  headers: object
): Promise<null | IdInfo> {
  try {
    const response = await rawGet<any>(axiosInstance, '/login/status', {
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
      accessToken: accessToken as string,
      idToken: idToken as string,
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

export async function isTokensValid(
  axiosInstance: AxiosInstance,
  project: string,
  tokens: AuthTokens
) {
  const idInfo = await getIdInfoFromAccessToken(
    axiosInstance,
    tokens.accessToken
  );
  return (
    idInfo !== null && idInfo.project.toLowerCase() === project.toLowerCase()
  );
}
