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

const ACCESS_TOKEN = 'accessToken';
const ID_TOKEN = 'idToken';
const EXPIRES_IN = 'expiresIn';
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

  // todo: validate token
  public handleLoginRedirect(): ADFSToken | null {
    try {
      const token = extractADFSToken(window.location.search);

      clearParametersFromUrl(ACCESS_TOKEN, ID_TOKEN, EXPIRES_IN);
      this.token = token;

      return token;
    } catch (e) {
      clearParametersFromUrl(ERROR);
      console.error(e);
    }

    return null;
  }

  public getAccessToken() {
    return this.token && this.token.accessToken;
  }

  public getIdToken() {
    return this.token && this.token.idToken;
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
      return `?${result}${result.length ? '&' : ''}${key}=${value}`;
    }, '');
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
