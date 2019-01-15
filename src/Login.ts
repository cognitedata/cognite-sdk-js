// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { stringify } from 'query-string';
import { configure, rawGet, rawPost } from './core';

export interface LoginParams {
  project?: string;
  redirectUrl: string;
  errorRedirectUrl?: string;
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

  public static loginWithRedirect(params: LoginParams): void {
    const url = Login.getLoginUrl(params);
    try {
      window.location.assign(url);
    } catch (err) {
      console.warn(
        'You can only call loginWithRedirect in a browser environment'
      );
    }
  }

  public static async retrieveLoginUrl(params: LoginParams): Promise<string> {
    const url = `${loginUrl()}/url`;
    const defaultProject = configure({}).project;
    const response = (await rawGet(url, {
      params: { project: defaultProject, ...params },
    })) as AxiosResponse<LoginUrlResponse>;
    return response.data.data.url;
  }

  public static async loginWithApiKey(apiKey: string): Promise<LoginStatus> {
    const url = loginUrl();
    const body = { apiKey };
    const response = (await rawPost(url, { data: body })) as AxiosResponse<
      LoginStatusResponse
    >;
    return response.data.data;
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
}
