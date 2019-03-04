// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import * as jwtDecode_ from 'jwt-decode';
import { isString } from 'lodash';
import { parse, stringify } from 'query-string';
import { rawGet } from '../axiosWrappers';
import { removeParameterFromUrl } from '../utils';
// https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-387462303
const jwtDecode = jwtDecode_;

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';
const IFRAME_NAME = 'cognite-js-sdk-auth-iframe';

interface AuthTokens {
  accessToken: string;
  idToken: string;
}

export interface IdInfo {
  project: string;
  user: string;
}

/** @hidden */
export interface AuthorizeParams {
  baseUrl: string;
  project: string;
  redirectUrl: string;
  errorRedirectUrl: string;
  accessToken?: string;
}

/** @hidden */
export interface OAuthResult {
  accessToken: string;
  user: string;
  project: string;
}

type TokenCallback = (token: string) => void;
type StopSchedule = () => void;

/** @hidden */
export async function getIdInfoFromApiKey(
  axiosInstance: AxiosInstance,
  apiKey: string
): Promise<null | IdInfo> {
  return getIdInfo(axiosInstance, { 'api-key': apiKey });
}

function getIdInfoFromAccessToken(
  axiosInstance: AxiosInstance,
  accessToken: string
): Promise<null | IdInfo> {
  return getIdInfo(axiosInstance, {
    Authorization: `Bearer: ${accessToken}`,
  });
}

/**
 * @hidden
 *
 * 0. Check if you are in a iFrame (don't do anything)
 * 1. Check if existing accessToken was passed in (in params).
 *   1. Check if the token is valid (if not ignore jump to step 3)
 *   2. Return AuthResult and set bearer token
 * 2. Check if error is present in the URL (if yes, throw error with error_description)
 * 3. Check if access_token & id_token is present in the URL
 *   1. Remove tokens from URL
 *   2. Validate the tokens with CDP. If not valid then ignore them. If valid then return AuthResult and set bearer token
 * 4. Try silent login (spin up an invisible iFrame and do login flow in there and grab access/id-tokens)
 *   - If successfull then return AuthResult and set bearer token
 * 5. Login with redirect
 */
export async function authorize(
  axiosInstance: AxiosInstance,
  params: AuthorizeParams
): Promise<OAuthResult> {
  // Step 0
  if (isAuthIFrame()) {
    // @ts-ignore
    return;
  }

  const checkAccessToken = (accessToken: string) => {
    return getIdInfoFromAccessToken(axiosInstance, accessToken);
  };

  const constructReturnValue = (accessToken: string, idInfo: IdInfo) => {
    return {
      accessToken,
      project: idInfo.project,
      user: idInfo.user,
    };
  };

  // Step 1
  if (params.accessToken != null) {
    const idInfo = await checkAccessToken(params.accessToken);
    if (idInfo !== null) {
      return constructReturnValue(params.accessToken, idInfo);
    }
  }

  // Step 2 & 3
  let authTokens;
  try {
    authTokens = parseTokenQueryParameters(window.location.search); // this line can throw exception
  } catch (e) {
    clearParametersFromUrl(ERROR_PARAM, ERROR_DESCRIPTION_PARAM);
    throw e;
  }
  if (authTokens !== null) {
    // Step 3.1
    clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
    // Step 3.2
    const idInfo = await checkAccessToken(authTokens.accessToken);
    if (idInfo !== null) {
      return constructReturnValue(authTokens.accessToken, idInfo);
    }
  }

  // try iframe login
  try {
    const silentAuthTokens = await silentLogin(params);
    const idInfo = await checkAccessToken(silentAuthTokens.accessToken);
    if (idInfo !== null) {
      return constructReturnValue(silentAuthTokens.accessToken, idInfo);
    }
  } catch (e) {
    //
  }
  await loginWithRedirect(params);
  // @ts-ignore (will do a browser redirect so nothing to care about)
  return;
}

export function scheduleAccessTokenRenewal(
  accessToken: string,
  axiosInstance: AxiosInstance,
  oAuthParams: AuthorizeParams,
  tokenCallback: TokenCallback
): StopSchedule {
  const timeLeftToRenewInMs = 50000; // when < 50 sec left
  const intervalInMs = 5000; // every 5 sec

  const getExpireTimeInMs = (token: string) => {
    // falsy token will throw an error.
    const decodedToken = jwtDecode<{ expire_time: number }>(token);
    return decodedToken.expire_time * 1000;
  };
  let expireTimeInMs: number = getExpireTimeInMs(accessToken);

  const task = setInterval(async () => {
    const nowInMs = Date.now();
    const timeToTriggerInMs = expireTimeInMs - timeLeftToRenewInMs;
    if (nowInMs < timeToTriggerInMs) {
      return;
    }
    const { baseUrl, project, redirectUrl, errorRedirectUrl } = oAuthParams;
    const authResult = await authorize(axiosInstance, {
      baseUrl,
      redirectUrl,
      errorRedirectUrl,
      project,
    });
    expireTimeInMs = getExpireTimeInMs(authResult.accessToken);
    tokenCallback(authResult.accessToken);
  }, intervalInMs);

  return () => {
    clearInterval(task);
  };
}

// utils

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

export function clearParametersFromUrl(...params: string[]): void {
  let url = window.location.href;
  params.forEach(param => {
    url = removeParameterFromUrl(url, param);
  });
  window.history.replaceState(null, '', url);
}

export function generateLoginUrl(params: AuthorizeParams): string {
  const { project, baseUrl, redirectUrl, errorRedirectUrl } = params;
  const queryParams = {
    project,
    redirectUrl,
    errorRedirectUrl,
  };
  return `${baseUrl}/login/redirect?${stringify(queryParams)}`;
}

function loginWithRedirect(params: AuthorizeParams): Promise<void> {
  return new Promise(() => {
    const url = generateLoginUrl(params);
    window.location.assign(url);
    // don't resolve promise since we do redirect
  });
}

function isAuthIFrame(): boolean {
  return window.name === IFRAME_NAME;
}

export function parseTokenQueryParameters(query: string): null | AuthTokens {
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

async function silentLogin(params: AuthorizeParams): Promise<AuthTokens> {
  return new Promise<AuthTokens>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.name = IFRAME_NAME;
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
