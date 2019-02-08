// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import * as jwtDecode_ from 'jwt-decode';
import { parse, stringify } from 'query-string';
import { configure, isBrowser, rawGet, setBearerToken } from './core';
import { scheduleTask } from './helpers/scheduler';

// https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-387462303
const jwtDecode = jwtDecode_;

export interface LoginParams {
  project?: string;
  redirectUrl: string;
  errorRedirectUrl: string;
}

/**
 * @hidden
 */
export interface LoginUrlResponse {
  data: {
    url: string;
  };
}

export interface LoginStatus {
  user: string;
  loggedIn: boolean;
  project: string;
  projectId: number;
}

/**
 * @hidden
 */
export interface LoginStatusResponse {
  data: LoginStatus;
}

export interface TokenStatus {
  token: string;
  valid: boolean;
  expired: boolean;
}

interface TokenStatusResponse {
  data: TokenStatus;
}

interface AuthTokens {
  accessToken: string;
  idToken: string;
}

export interface AuthResult {
  accessToken: string;
  idToken: string;
  user: string;
  project: string;
  projectId: number;
}

const IFRAME_NAME = 'cognite-js-sdk-auth-iframe';
const ACCESS_TOKEN = 'access_token';
const ID_TOKEN = 'id_token';

function isAuthIFrame(): boolean {
  return window.name === IFRAME_NAME;
}

function removeParameterFromUrl(url: string, parameter: string): string {
  return url
    .replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
}

function isString(value: any): boolean {
  return typeof value === 'string';
}

let cancelSchedule = () => {};

/**
 * @hidden
 */
const loginUrl = (): string => `/login`;

export class Login {
  public static getLoginUrl(params: LoginParams): string {
    const defaultProject = configure({}).project;
    const queryParams = {
      project: defaultProject,
      ...params,
    };
    const baseUrl = configure({}).baseUrl;
    const url = `${baseUrl}${loginUrl()}/redirect?${stringify(queryParams)}`;
    return url;
  }

  // 0. Check if you are in a iFrame (don't do anything)
  // 1. Check if error is present in the URL (if yes, throw error with error_description)
  // 2. Check if access_token & id_token is present in the URL
  //   1. Remove tokens from URL
  //   2. Validate the tokens with CDP. If not valid then ignore them. If valid then return AuthResult and set bearer token
  // 3. Try silent login (spin up an invisible iFrame and do login flow in there and grab access/id-tokens)
  //   - If successfull then return AuthResult and set bearer token
  // 4. Login with redirect
  public static async authorize(
    params: LoginParams,
    tokenCallback: (token: string) => void = () => {}
  ): Promise<AuthResult> {
    if (!isBrowser) {
      throw new Error('You can only call "authorize" in a browser environment');
    }

    // Step 0
    if (isAuthIFrame()) {
      // @ts-ignore
      return;
    }

    const verifyAuthTokens = async (
      tokens: AuthTokens
    ): Promise<null | AuthResult> => {
      const authResult = await Login.verifyAccessToken(tokens);
      if (authResult !== null) {
        configure({ project: authResult.project });
        Login.scheduleRenewal(params, authResult.accessToken, tokenCallback);
        return authResult;
      }
      return null;
    };

    // Step 1
    const authTokens = Login.parseQuery(window.location.search);
    if (authTokens !== null) {
      // Step 2.1
      let url = window.location.href;
      url = removeParameterFromUrl(url, ACCESS_TOKEN);
      url = removeParameterFromUrl(url, ID_TOKEN);
      window.history.replaceState(null, '', url);
      // Step 2.2
      const authResult = await verifyAuthTokens(authTokens);
      if (authResult !== null) {
        return authResult;
      }
    }

    // try iframe login
    try {
      const silentAuthTokens = await Login.silentLogin(params);
      const authResult = await verifyAuthTokens(silentAuthTokens);
      if (authResult !== null) {
        return authResult;
      }
    } catch (e) {
      //
    }
    Login.loginWithRedirect(params);
    // @ts-ignore (will do a browser redirect so nothing to care about)
    return;
  }

  public static loginWithRedirect(params: LoginParams): void {
    if (!isBrowser) {
      throw new Error(
        'You can only call "loginWithRedirect" in a browser environment'
      );
    }
    const url = Login.getLoginUrl(params);
    window.location.assign(url);
  }

  public static async loginWithApiKey(apiKey: string): Promise<LoginStatus> {
    configure({ apiKey });
    const loginStatus = await Login.verifyStatus();
    const { project } = loginStatus;
    if (configure({}).project && configure({}).project !== project) {
      throw new Error(
        `The api key is for a different project than configured: ${project} vs ${
          configure({}).project
        }`
      );
    }
    configure({ project });
    return loginStatus;
  }

  public static async validateJWT(token: string): Promise<TokenStatus> {
    const url = `${loginUrl()}/token`;
    const params = { token };
    const response = (await rawGet(url, { params })) as AxiosResponse<
      TokenStatusResponse
    >;
    return response.data.data;
  }

  public static async verifyStatus(): Promise<LoginStatus> {
    const url = `${loginUrl()}/status`;
    const response = (await rawGet(url)) as AxiosResponse<LoginStatusResponse>;
    return response.data.data;
  }

  public static async retrieveLoginUrl(params: LoginParams): Promise<string> {
    console.warn(
      'retrieveLoginUrl is deprecated. Please use loginWithRedirect instead'
    );
    const url = `${loginUrl()}/url`;
    const defaultProject = configure({}).project;
    const response = (await rawGet(url, {
      params: { project: defaultProject, ...params },
    })) as AxiosResponse<LoginUrlResponse>;
    return response.data.data.url;
  }

  private static parseQuery(
    query: string = window.location.search
  ): null | AuthTokens {
    const {
      [ACCESS_TOKEN]: accessToken,
      [ID_TOKEN]: idToken,
      error,
      error_description: errorDescription,
    } = parse(query);
    if (error !== undefined) {
      throw new Error(`${error}: ${errorDescription}`);
    }

    if (isString(accessToken) && isString(idToken)) {
      return {
        accessToken: accessToken as string,
        idToken: idToken as string,
      };
    }

    return null;
  }

  private static scheduleRenewal(
    params: LoginParams,
    accessToken: string,
    tokenCallback: (token: string) => void,
    timeLeftToRenewInMs: number = 50000,
    intervalInMs: number = 5000
  ) {
    // cancel potensially former scheduleRenewal
    cancelSchedule();

    tokenCallback(accessToken);
    // falsy token will throw an error.
    const decodedToken = jwtDecode<{ expire_time: number }>(accessToken);
    const expireTimeInMs = decodedToken.expire_time * 1000;

    cancelSchedule = scheduleTask(
      () => {
        Login.authorize(params, tokenCallback);
      },
      expireTimeInMs - timeLeftToRenewInMs,
      intervalInMs
    );
  }

  private static async silentLogin(params: LoginParams): Promise<AuthTokens> {
    return new Promise<AuthTokens>((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.name = IFRAME_NAME;
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.border = 'none';
      iframe.onload = () => {
        try {
          const authTokens = Login.parseQuery(
            iframe.contentWindow!.location.search
          );
          if (authTokens === null) {
            throw new Error('Failed to login');
          }
          resolve(authTokens);
        } catch (e) {
          reject(e);
        } finally {
          document.body.removeChild(iframe);
        }
      };
      iframe.src = `${Login.getLoginUrl(params)}&prompt=none`;
      document.body.appendChild(iframe);
    });
  }

  private static async verifyAccessToken(
    authTokens: AuthTokens
  ): Promise<null | AuthResult> {
    setBearerToken(authTokens.accessToken);
    const loginStatus = await Login.verifyStatus();
    if (loginStatus.loggedIn) {
      return {
        ...authTokens,
        ...loginStatus,
      };
    }
    return null;
  }
}
