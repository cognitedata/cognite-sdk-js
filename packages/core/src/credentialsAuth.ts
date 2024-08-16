// Copyright 2022 Cognite AS

import { verifyCredentialsRequiredFields } from './loginUtils';
import { isFunction } from 'lodash-es';
import type { BasicHttpClient } from './httpClient/basicHttpClient';

import { AUTHORIZATION_HEADER, API_KEY_HEADER } from './constants';

import { bearerString } from './utils';

export interface TokenCredentials {
  token_type: string;
  expires_in: string;
  ext_expires_in: string;
  expires_on?: string;
  not_before?: string;
  resource?: string;
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  expires_at?: number;
  session_state?: string;
}

export interface ClientCredentials {
  method: 'api' | 'client_credentials' | 'device' | 'implicit' | 'pkce';
  apiKey?: string;
  authority?: string;
  client_id?: string;
  client_secret?: string;
  response_type?: string;
  grant_type?: string;
  scope?: string;
  authContext?: string;
}

export class CredentialsAuth {
  private tokenCredentials: TokenCredentials = {} as TokenCredentials;

  constructor(
    private httpClient: BasicHttpClient,
    private credentials: ClientCredentials | undefined,
    private authProvider: any
  ) {
    this.process();
  }

  public process() {
    if (this.credentials) {
      if (this.authProvider && isFunction(this.authProvider.requires)) {
        this.authProvider.requires(this.credentials);
      } else {
        verifyCredentialsRequiredFields(this.credentials);
      }

      if (this.credentials?.method !== 'api' && !this.authProvider) {
        throw Error(
          'options.authentication.authProvider is required and must be a class that implements a static load method and can call a login method.'
        );
      }
    }

    if (this.authProvider && !isFunction(this.authProvider.load)) {
      throw Error('The authProvider needs to have a load method.');
    }

    if (this.authProvider && !isFunction(this.authProvider.load().login)) {
      throw Error(
        'The authProvider load method needs to be able to call call a login method.'
      );
    }

    if (this.authProvider === undefined) return;

    if (this.credentials) {
      if (
        !this.credentials.authContext &&
        !this.authProvider.load(true, true).method &&
        !this.authProvider.load(true, true).settings
      ) {
        throw Error(
          'Please, use the recommended authProvider: @cognite/auth-wrapper'
        );
      }
      if (
        this.credentials.authContext &&
        !this.authProvider.load(true, true).method &&
        !this.authProvider.load(true, true).authContext
      ) {
        throw Error(
          'Please, use the recommended authProvider: @cognite/react-auth-wrapper'
        );
      }
    }
  }

  public authenticate: () => Promise<string | undefined> = async () => {
    try {
      if (!this.credentials) return;

      if (this.credentials.method === 'api') {
        const token: string = this.credentials.apiKey!;
        this.httpClient.setDefaultHeader(API_KEY_HEADER, token);

        return token;
      }

      if (this.tokenCredentials.refresh_token) {
        this.tokenCredentials.access_token = '';
      }

      if (!this.credentials.authContext) {
        this.tokenCredentials = await this.authProvider
          .load(this.credentials.method, this.credentials)
          .login(this.isRefreshToken());
      } else {
        this.tokenCredentials = await this.authProvider
          .load(this.credentials.method, this.credentials.authContext)
          .login(this.isRefreshToken());
      }

      let token;
      if (
        this.tokenCredentials.access_token !== undefined &&
        this.tokenCredentials.access_token !== ''
      ) {
        token = this.tokenCredentials.access_token;

        this.httpClient.setDefaultHeader(
          AUTHORIZATION_HEADER,
          bearerString(token!)
        );
      }

      return token;
    } catch (e) {
      console.error(`An error ocurred while attempting to authenticate`, e);
      return;
    }
  };

  private isRefreshToken(): any {
    return (
      (this.credentials?.method === 'device' ||
        this.credentials?.method === 'pkce') &&
      this.tokenCredentials.refresh_token
    );
  }

  public isApiKeyMode(): boolean {
    return this.credentials?.method === 'api';
  }
}
