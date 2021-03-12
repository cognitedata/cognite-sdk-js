// Copyright 2020 Cognite AS

import {
  HttpQueryParams,
  HttpCall,
  HttpHeaders,
} from './httpClient/basicHttpClient';
import { LogoutUrlResponse } from './types';

export interface IdInfo {
  projectId: number;
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
export interface AuthenticateParams {
  project: string;
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
