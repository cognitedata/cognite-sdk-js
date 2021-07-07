// Copyright 2020 Cognite AS

import { parse } from 'query-string';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { clearParametersFromUrl } from './utils';
import { silentLoginViaIframe } from './loginUtils';

export interface ADFSConfig {
  authority: string;
  requestParams: ADFSRequestParams;
}
export interface ADFSRequestParams {
  resource: string;
  clientId: string;
}
export interface ADFSQueryParams {
  client_id: string;
  audience: string;
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
  audience: string;
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
  audience: 'audience',
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
const LOGIN_IFRAME_NAME = 'adfsSilentLoginIframe';

export class ADFS {
  private readonly authority: string;
  private readonly queryParams: ADFSQueryParams;
  private token: ADFSToken | null = null;

  constructor({ authority, requestParams }: ADFSConfig) {
    this.authority = authority;
    this.queryParams = this.getADFSQueryParams(requestParams);
  }

  public async login(): Promise<string | void> {
    const token = await this.acquireTokenSilently();

    return new Promise(resolve => {
      if (token) {
        resolve(token.accessToken);
      }

      const url = `${this.authority}?${this.getADFSQueryParamString(
        this.queryParams
      )}`;

      console.log('url', url);

      window.location.href = url;
    });
  }

  public handleLoginRedirect(): ADFSToken | null {
    try {
      const queryParams = window.location.hash;

      if (!queryParams) {
        return null;
      }

      const token = extractADFSToken(queryParams);

      console.log('token2', queryParams, token);

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
      console.error(e);
    }

    return null;
  }

  public async getCDFToken(): Promise<string | null> {
    const token = await this.acquireTokenSilently();

    return token
      ? token.accessToken
      : this.token
        ? this.token.accessToken
        : null;
  }

  public async getIdToken(): Promise<string | null> {
    const token = await this.acquireTokenSilently();

    return token ? token.idToken : this.token ? this.token.idToken : null;
  }

  /**
   * This method going to work only if 'X-Frame-Options' header
   * set to 'allow-from https://www.example.com' on the ADFS server.
   * And this is the only way to acquire token with ADFS silently
   * (using implicit grant flow)
   */
  private async acquireTokenSilently(): Promise<ADFSToken | null> {
    const url = `${this.authority}?prompt=none&${this.getADFSQueryParamString(
      this.queryParams
    )}`;

    let token: ADFSToken | null = null;

    try {
      token = await silentLoginViaIframe<ADFSToken | null>(
        url,
        extractADFSToken,
        LOGIN_IFRAME_NAME
      );
    } catch (e) {
      noop();
    }

    if (token) {
      this.token = token;
    }

    return token;
  }

  private getADFSQueryParams({
    // resource,
    clientId,
  }: ADFSRequestParams): ADFSQueryParams {
    const responseMode = 'query';
    const responseType = 'code';
    const scope = `openid profile`;
    const redirectUri = window.location.href;
    const audience = 'https://twindata.io/az-test/T101014843';
    const params = {
      clientId,
      scope,
      responseMode,
      responseType,
      // resource,
      redirectUri,
      audience,
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
    }, '');
  }
}

export function extractADFSToken(query: string): ADFSToken | null {
  const {
    [ACCESS_TOKEN]: accessToken,
    [ID_TOKEN]: idToken,
    [EXPIRES_IN]: expiresIn,
  } = parse(query);

  if (isString(accessToken) && isString(idToken)) {
    return {
      accessToken,
      idToken,
      expiresIn: Date.now() + Number(expiresIn),
    };
  }

  return null;
}
