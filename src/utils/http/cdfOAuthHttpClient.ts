// Copyright 2019 Cognite AS

import { AUTHORIZATION_HEADER } from '@/constants';
import { CogniteLoginError } from '@/loginError';
import {
  bearerString,
  createInvisibleIframe,
  generatePopupWindow,
  isSameProject,
  removeQueryParameterFromUrl,
} from '@/utils';
import { isString } from 'lodash';
import { parse, stringify } from 'query-string';
import { CDFHttpClient } from './cdfHttpClient';
import { HttpError } from './httpError';

export class CDFOAuthHttpClient extends CDFHttpClient {
  private static loginWithRedirect(params: AuthorizeParams): Promise<void> {
    const unresolveablePromise = new Promise<void>(() => {
      const url = CDFOAuthHttpClient.generateLoginUrl(params);
      window.location.assign(url);
    });
    return unresolveablePromise;
  }

  private static loginWithPopup(
    params: AuthorizeParams
  ): Promise<null | AuthTokens> {
    return new Promise((resolve, reject) => {
      const url = CDFOAuthHttpClient.generateLoginUrl(params);
      const loginPopupWindow = generatePopupWindow(url, LOGIN_POPUP_NAME);
      if (loginPopupWindow === null) {
        reject(new CogniteLoginError('Failed to create login popup window'));
        return;
      }
      const tokenListener = (message: MessageEvent) => {
        const isUntrustedSource = message.source !== loginPopupWindow;
        if (isUntrustedSource) {
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

  private static silentLogin(params: AuthorizeParams): Promise<AuthTokens> {
    return new Promise<AuthTokens>((resolve, reject) => {
      const url = `${CDFOAuthHttpClient.generateLoginUrl(params)}&prompt=none`;
      const iframe = createInvisibleIframe(url, LOGIN_IFRAME_NAME);
      iframe.onload = () => {
        try {
          const authTokens = CDFOAuthHttpClient.parseTokenQueryParameters(
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

  private static generateLoginUrl({
    project,
    baseUrl,
    redirectUrl,
    errorRedirectUrl,
  }: AuthorizeParams): string {
    const queryParams = {
      project,
      redirectUrl,
      errorRedirectUrl: errorRedirectUrl || redirectUrl,
    };
    return `${baseUrl}/login/redirect?${stringify(queryParams)}`;
  }

  private static extractTokensFromUrl() {
    try {
      const tokens = CDFOAuthHttpClient.parseTokenQueryParameters(
        window.location.search
      );
      CDFOAuthHttpClient.removeQueryParametersFromUrl([
        ACCESS_TOKEN_PARAM,
        ID_TOKEN_PARAM,
      ]);
      return tokens;
    } catch (err) {
      CDFOAuthHttpClient.removeQueryParametersFromUrl([
        ERROR_PARAM,
        ERROR_DESCRIPTION_PARAM,
      ]);
      throw err;
    }
  }

  private static parseTokenQueryParameters(query: string): null | AuthTokens {
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

  private static removeQueryParametersFromUrl(params: string[]): void {
    let url = window.location.href;
    params.forEach(param => {
      url = removeQueryParameterFromUrl(url, param);
    });
    window.history.replaceState(null, '', url);
  }

  private static isLoginPopupWindow(): boolean {
    return window.name === LOGIN_POPUP_NAME;
  }

  private static isAuthIFrame(): boolean {
    return window.name === LOGIN_IFRAME_NAME;
  }

  private static async loginSilently(
    params: AuthenticateParams
  ): Promise<null | AuthTokens> {
    const { baseUrl, project } = params;
    const href = window.location.href;
    const tokens = await CDFOAuthHttpClient.silentLogin({
      baseUrl,
      project,
      redirectUrl: href,
      errorRedirectUrl: href,
    });
    return tokens;
  }

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  private async validateTokens(project: string, tokens: AuthTokens) {
    const idInfo = await super.getIdInfo({
      [AUTHORIZATION_HEADER]: bearerString(tokens.accessToken),
    });
    return idInfo !== null && isSameProject(idInfo.project, project);
  }
}

/** @hidden */
export interface AuthorizeParams extends AuthorizeOptions {
  baseUrl: string;
  project: string;
  accessToken?: string;
}

export interface AuthorizeOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
}

/** @hidden */
export interface AuthenticateParams {
  project: string;
  baseUrl: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';
const LOGIN_IFRAME_NAME = 'cognite-js-sdk-auth-iframe';
const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';

type NotAuthenticatedHandler = (
  err: HttpError,
  retry: () => void,
  ignore: () => void
) => void;
