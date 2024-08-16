// Copyright 2020 Cognite AS

import { isObject, isString } from 'lodash-es';
import type { ClientOptions } from './baseCogniteClient';
import type { ClientCredentials } from './credentialsAuth';
import { CogniteError } from './error';
import type { HttpCall, HttpQueryParams } from './httpClient/basicHttpClient';
import { CogniteLoginError } from './loginError';
import type { LogoutUrlResponse } from './types';
import { createInvisibleIframe, generatePopupWindow } from './utils';

const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';
const LOGIN_IFRAME_NAME = 'silentLoginIframe';

export const ACCESS_TOKEN_PARAM = 'access_token';
export const ID_TOKEN_PARAM = 'id_token';
export const ERROR_PARAM = 'error';
export const ERROR_DESCRIPTION_PARAM = 'error_description';

interface CredentialsVerification {
  method: string;
  field: string;
}

const OPTIONS_REQUIRED_FIELDS: string[] = ['appId', 'project'];

const CREDENTIALS_REQUIRED_FIELDS: CredentialsVerification[] = [
  { method: 'api', field: 'apiKey' },
  { method: 'client_credentials', field: 'authority' },
  { method: 'client_credentials', field: 'client_id' },
  { method: 'client_credentials', field: 'client_secret' },
  { method: 'client_credentials', field: 'scope' },
  { method: 'client_credentials', field: 'grant_type' },
  { method: 'device', field: 'authority' },
  { method: 'device', field: 'client_id' },
  { method: 'device', field: 'scope' },
  { method: 'implicit', field: 'authority' },
  { method: 'implicit', field: 'client_id' },
  { method: 'implicit', field: 'scope' },
  { method: 'pkce', field: 'authority' },
  { method: 'pkce', field: 'client_id' },
  { method: 'pkce', field: 'scope' },
];

/** @hidden */
export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

/** @hidden */
export interface AuthorizeParams extends AuthorizeOptions {
  baseUrl: string;
  project: string;
  accessToken?: string;
}
/** @hidden **/
export interface AuthorizeOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
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
    if (err instanceof Error) {
      window.opener.postMessage({ error: err.message });
    } else {
      throw err;
    }
  } finally {
    window.close();
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
    if (err instanceof CogniteError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

/** @hidden */
export function parseTokenQueryParameters(query: string): null | AuthTokens {
  const queryParams = new URLSearchParams(query);
  const accessToken = queryParams.get(ACCESS_TOKEN_PARAM);
  const idToken = queryParams.get(ID_TOKEN_PARAM);
  const error = queryParams.get(ERROR_PARAM);
  const errorDescription = queryParams.get(ERROR_DESCRIPTION_PARAM);
  if (error !== null) {
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

/** @hidden */
export function loginWithRedirect(params: AuthorizeParams): Promise<void> {
  // we want to return a promise which never gets resolved (window will redirect)
  return new Promise<void>(() => {
    const url = generateLoginUrl(params);
    window.location.assign(url);
  });
}

/** @hidden */
export function loginWithPopup(
  params: AuthorizeParams,
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

/** @hidden **/
export async function silentLoginViaIframe<TokenType>(
  url: string,
  extractor: (query: string) => TokenType,
  iframeName: string = LOGIN_IFRAME_NAME,
  locationPart: 'hash' | 'search' = 'hash',
): Promise<TokenType> {
  return new Promise<TokenType>((resolve, reject) => {
    const iframe = createInvisibleIframe(url, iframeName);

    iframe.onload = () => {
      try {
        if (!iframe.contentWindow) {
          throw Error('Failed to login silently');
        }
        const authTokens = extractor(
          iframe.contentWindow.location[locationPart],
        );
        if (authTokens === null) {
          throw Error('Failed to login silently');
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

function generateLoginUrl(params: AuthorizeParams): string {
  const { project, baseUrl, redirectUrl, errorRedirectUrl } = params;
  const queryParams = {
    project,
    redirectUrl,
    errorRedirectUrl: errorRedirectUrl || redirectUrl,
  };
  const search = new URLSearchParams(queryParams).toString();
  return `${baseUrl}/login/redirect?${search}`;
}

/**
 * It verify if credentials contain require fields depending each method.
 * @param credentials ClientCredentials
 */
export function verifyCredentialsRequiredFields(
  credentials: ClientCredentials,
): void {
  if (!isObject(credentials)) {
    throw Error('options.credentials is required');
  }

  if (!credentials.method) {
    throw Error(
      'options.credentials.method is required and must be of type string with one of this values: api, client_credentials, device, implicit, pkce',
    );
  }

  for (let index = 0; index < CREDENTIALS_REQUIRED_FIELDS.length; index++) {
    const field = CREDENTIALS_REQUIRED_FIELDS[index];

    if (
      credentials.method &&
      credentials.method === field.method &&
      // @ts-ignore
      !credentials[field.field]
    ) {
      throw Error(
        `options.credentials.${field.field} is required and must be of type string`,
      );
    }
  }
}

/**
 * It verify if options contain require fields .
 * @param credentials ClientCredentials
 */
export function verifyOptionsRequiredFields(options: ClientOptions): void {
  if (!isObject(options)) {
    throw Error('`CogniteClient` is missing parameter `options`');
  }

  for (let index = 0; index < OPTIONS_REQUIRED_FIELDS.length; index++) {
    const field = OPTIONS_REQUIRED_FIELDS[index];

    // @ts-ignore
    if (!isString(options[field])) {
      throw Error(`options.${field} is required and must be of type string`);
    }
  }
}
