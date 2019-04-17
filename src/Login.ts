// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import * as jwtDecode_ from 'jwt-decode';
import { parse, stringify } from 'query-string';
import { configure, instance, isBrowser, rawGet, setBearerToken } from './core';
import { scheduleTask } from './helpers/scheduler';

// https://github.com/jvandemo/generator-angular2-library/issues/221#issuecomment-387462303
const jwtDecode = jwtDecode_;

export interface LoginParams {
  project?: string;
  redirectUrl: string;
  errorRedirectUrl: string;
}

export interface AuthorizeParams {
  project?: string;
  redirectUrl: string;
  errorRedirectUrl: string;
  accessToken?: string;
  idToken?: string;
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
  // 1. Check if existing accessToken was passed in (in params).
  //   1. Check if the token is valid (if not ignore jump to step 3)
  //   2. Return AuthResult and set bearer token
  // 2. Check if error is present in the URL (if yes, throw error with error_description)
  //   1. Remove tokens from URL
  // 3. Check if access_token & id_token is present in the URL
  //   2. Validate the tokens with CDP. If not valid then ignore them. If valid then return AuthResult and set bearer token
  // 4. Try silent login (spin up an invisible iFrame and do login flow in there and grab access/id-tokens)
  //   - If successfull then return AuthResult and set bearer token
  // 5. Login with redirect
  public static async authorize(
    params: AuthorizeParams,
    tokenCallback: (token: string) => void = () => {}
  ): Promise<AuthResult> {
    if (!isBrowser) {
      throw new Error('You can only call "authorize" in a browser environment');
    }

    // Step 0
    if (isAuthIFrame()) {
      // @ts-ignore (it will never resolve)
      return new Promise(() => {});
    }

    const verifyAuthTokens = async (
      accessToken: string,
      idToken: string
    ): Promise<null | AuthResult> => {
      const authResult = await Login.verifyTokens(accessToken, idToken);
      if (authResult !== null) {
        configure({ project: authResult.project });
        Login.scheduleRenewal(params, accessToken, idToken, tokenCallback);
        return authResult;
      }
      return null;
    };

    // Step 1
    if (params.accessToken != null && params.idToken != null) {
      const defaultProject = params.project || configure({}).project || '';
      const authResult = await verifyAuthTokens(
        params.accessToken,
        params.idToken
      );

      if (
        authResult !== null &&
        authResult.project.toLowerCase() === defaultProject.toLowerCase()
      ) {
        return authResult;
      }
    }

    // Step 2
    const authTokens = Login.parseQuery(window.location.search); // this line can throw
    // Step 2.1
    let url = window.location.href;
    url = removeParameterFromUrl(url, ACCESS_TOKEN);
    url = removeParameterFromUrl(url, ID_TOKEN);
    window.history.replaceState(null, '', url);

    if (authTokens !== null) {
      // Step 3.2
      const authResult = await verifyAuthTokens(
        authTokens.accessToken,
        authTokens.idToken
      );
      if (authResult !== null) {
        return authResult;
      }
    }

    // try iframe login
    try {
      const silentAuthTokens = await Login.silentLogin(params);
      const authResult = await verifyAuthTokens(
        silentAuthTokens.accessToken,
        silentAuthTokens.idToken
      );
      if (authResult !== null) {
        return authResult;
      }
    } catch (e) {
      //
    }

    // Login.authorize should never resolve on browser redirect (to avoid return value undefined)
    // @ts-ignore
    return new Promise(() => {
      Login.loginWithRedirect(params);
    });
  }

  public static stopAutoAuthorize(): void {
    cancelSchedule();
    cancelSchedule = () => {};
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
    if (loginStatus === null) {
      throw Error('Invalid apikey');
    }
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
    const authHeader = instance.defaults.headers.Authorization;
    delete instance.defaults.headers.Authorization;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      TokenStatusResponse
    >;
    instance.defaults.headers.Authorization = authHeader;
    return response.data.data;
  }

  public static async verifyStatus(): Promise<null | LoginStatus> {
    const url = `${loginUrl()}/status`;
    try {
      const response = (await rawGet(url)) as AxiosResponse<
        LoginStatusResponse
      >;
      return response.data.data;
    } catch (err) {
      if (err.status === 401) {
        return null;
      }
      throw err;
    }
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
    idToken: string,
    tokenCallback: (token: string) => void,
    timeLeftToRenewInMs: number = 50000,
    intervalInMs: number = 5000
  ) {
    // cancel potensially former scheduleRenewal
    cancelSchedule();

    tokenCallback(accessToken);
    // falsy token will throw an error.
    const decodedToken = jwtDecode<{ expire_time: number }>(idToken);
    const expireTimeInMs = decodedToken.expire_time * 1000;

    cancelSchedule = scheduleTask(
      () => {
        cancelSchedule();
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

  private static async verifyTokens(
    accessToken: string,
    idToken: string
  ): Promise<null | AuthResult> {
    const decodedToken = jwtDecode<{
      expire_time: number;
      project_name: string;
    }>(idToken);

    setBearerToken(accessToken);
    const [loginStatus, idTokenInfo] = await Promise.all([
      Login.verifyStatus(),
      Login.validateJWT(idToken),
    ]);
    if (
      loginStatus !== null &&
      loginStatus.loggedIn &&
      idTokenInfo.valid === true &&
      idTokenInfo.expired === false &&
      decodedToken.project_name === loginStatus.project
    ) {
      return {
        accessToken,
        idToken,
        user: loginStatus.user,
        project: loginStatus.project,
        projectId: loginStatus.projectId,
      };
    }
    return null;
  }
}
