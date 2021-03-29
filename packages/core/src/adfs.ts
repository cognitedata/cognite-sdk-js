// Copyright 2020 Cognite AS

import { parse } from 'query-string';
import isString from 'lodash/isString';
import { clearParametersFromUrl } from './utils';

export interface ADFSConfig {
  authority: string;
  requestParams: ADFSRequestParams;
}
export interface ADFSRequestParams {
  cluster: string;
  clientId: string;
  scope: string;
}
export interface ADFSQueryParams {
  client_id: string;
  scope: string;
  redirect_uri: string;
  response_mode: string;
  response_type: string;
  resource: string;
}
export interface ADFSToken {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}
interface ADFSRequestParamsWithDefaults {
  clientId: string;
  scope: string;
  redirectUri: string;
  responseMode: string;
  responseType: string;
  resource: string;
}

type ADFSRequestParamsMapping = {
  [key in keyof ADFSRequestParamsWithDefaults]: keyof ADFSQueryParams
};

const adfsRequestParamsMapping: ADFSRequestParamsMapping = {
  clientId: 'client_id',
  scope: 'scope',
  redirectUri: 'redirect_uri',
  responseMode: 'response_mode',
  responseType: 'response_type',
  resource: 'resource',
};

const ACCESS_TOKEN = 'access_token';
const ID_TOKEN = 'id_token';
const EXPIRES_IN = 'expires_in';
const TOKEN_TYPE = 'token_type';
const SCOPE = 'scope';
const ERROR = 'error';

class ADFS {
  private authority: string;
  private queryParams: ADFSQueryParams;
  private token: ADFSToken | null = null;

  constructor({ authority, requestParams }: ADFSConfig) {
    this.authority = authority;
    this.queryParams = this.getADFSQueryParams(requestParams);
  }

  public async login(): Promise<void> {
    const url = `${this.authority}${this.getADFSQueryParamString(
      this.queryParams
    )}`;

    window.location.href = url;
  }

  public handleLoginRedirect(): ADFSToken | null {
    try {
      const url = window.location.href;

      const index = url.indexOf('#');

      if (index === -1 || url.length <= index + 1) {
        return null;
      }

      const token = extractADFSToken(url.substring(index + 1, url.length));

      clearParametersFromUrl(
        ACCESS_TOKEN,
        ID_TOKEN,
        EXPIRES_IN,
        SCOPE,
        TOKEN_TYPE
      );
      this.token = token;

      return token;
    } catch (e) {
      clearParametersFromUrl(ERROR);
      console.error(e);
    }

    return null;
  }

  // todo: validate token
  public getCDFToken(): string | null {
    return this.token ? this.token.accessToken : null;
  }

  public getIdToken(): string | null {
    return this.token ? this.token.idToken : null;
  }

  private getADFSQueryParams({
    cluster,
    clientId,
    scope,
  }: ADFSRequestParams): ADFSQueryParams {
    const responseMode = 'fragment';
    const responseType = 'id_token token';
    const resource = `https://${cluster}.cognitedata.com`;
    const redirectUri = window.location.href;
    const params = {
      clientId,
      scope,
      responseMode,
      responseType,
      resource,
      redirectUri,
    };
    return Object.entries(params).reduce<ADFSQueryParams>(
      (result, [key, value]) => {
        const param =
          adfsRequestParamsMapping[key as keyof ADFSRequestParamsWithDefaults];

        result[param] = value;

        return result;
      },
      {} as ADFSQueryParams
    );
  }

  private getADFSQueryParamString(params: ADFSQueryParams): string {
    return Object.entries(params).reduce((result, [key, value]) => {
      return `${result}${result.length > 1 ? '&' : ''}${key}=${value}`;
    }, '?');
  }
}

export function extractADFSToken(query: string): ADFSToken | null {
  const {
    [ACCESS_TOKEN]: accessToken,
    [ID_TOKEN]: idToken,
    [EXPIRES_IN]: expiresIn,
    [ERROR]: error,
  } = parse(query);

  if (error) {
    throw error;
  }

  if (isString(accessToken) && isString(idToken)) {
    return {
      accessToken,
      idToken,
      expiresIn: Number(expiresIn),
    };
  }

  return null;
}

export default ADFS;
