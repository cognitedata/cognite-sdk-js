// Copyright 2020 Cognite AS

import {
  PublicClientApplication,
  SilentRequest,
  AuthenticationResult,
  Configuration,
  AccountInfo,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
  LogLevel,
  BrowserSystemOptions,
  CacheOptions,
} from '@azure/msal-browser';

export interface AzureADOptions {
  cluster: string;
  config: Configuration;
  debug?: boolean;
}
export const LOGIN_POPUP = 'loginPopup';
export const LOGIN_REDIRECT = 'loginRedirect';
export type AzureADSingInType = typeof LOGIN_POPUP | typeof LOGIN_REDIRECT;

const loggerCallback = (level: LogLevel, message: string, containsPi: any) => {
  if (containsPi) {
    return;
  }
  switch (level) {
    case LogLevel.Error:
      console.error(message);
      return;
    case LogLevel.Info:
      console.info(message);
      return;
    case LogLevel.Verbose:
      console.debug(message);
      return;
    case LogLevel.Warning:
      console.warn(message);
  }
};
const accountLocalStorageKey = '@cognite/sdk:accountLocalId';

export class AzureAD {
  private msalApplication: PublicClientApplication;
  private account?: AccountInfo;
  private userScopes = ['User.Read'];
  private cluster: string = '';

  static getDefaultMSALConfig(
    debug: boolean = false
  ): { cache: CacheOptions; system?: BrowserSystemOptions } {
    return {
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
      system: debug ? { loggerOptions: { loggerCallback } } : undefined,
    };
  }

  constructor({ cluster, config, debug }: AzureADOptions) {
    const msalDefaultConfig = AzureAD.getDefaultMSALConfig(debug);
    this.msalApplication = new PublicClientApplication({
      ...msalDefaultConfig,
      ...config,
    });
    this.cluster = cluster;
  }

  getCluster(): string {
    return this.cluster;
  }

  /**
   * Returns account which has been saved in local storage by localAccountId
   */
  getAccount(): AccountInfo | null {
    const localAccountId = this.getLocalAccountIdFromLocalStorage();

    return localAccountId
      ? this.msalApplication.getAccountByLocalId(localAccountId)
      : null;
  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly.
   * Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  async initAuth(): Promise<AccountInfo | void> {
    const account = await this.handleAuthRedirect();

    return this.handleAuthAccountResult(account);
  }

  /**
   * Calls loginPopup or loginRedirect based on given signInType.
   * @param signInType
   */
  async login(
    signInType: AzureADSingInType = LOGIN_REDIRECT
  ): Promise<AccountInfo | void> {
    if (signInType === LOGIN_POPUP) {
      try {
        const { account } = await this.msalApplication.loginPopup(
          this.loginPopupRequest
        );

        return this.handleAuthAccountResult(account);
      } catch (error) {
        console.error(error);
      }
    } else {
      await this.msalApplication.loginRedirect(this.loginRedirectRequest);
    }
  }

  /**
   * Logs out of current account.
   */
  async logout(): Promise<void> {
    const logOutRequest: EndSessionRequest = {
      account: this.account || undefined,
    };

    await this.msalApplication.logout(logOutRequest);

    this.setLocalAccountIdToLocalStorage();

    this.account = undefined;
  }

  /**
   * Returns already acquired CDF access token
   */
  async getCDFToken(): Promise<string | null> {
    if (!this.account) return null;

    const {
      accessToken,
    }: AuthenticationResult = await this.msalApplication.acquireTokenSilent(
      this.silentCDFTokenRequest
    );

    return accessToken;
  }

  /**
   * Returns azure account access token.
   * Can be used for getting user details via Microsoft Graph API
   */
  async getAccountToken(): Promise<string | null> {
    if (this.account) return null;

    const {
      accessToken,
    }: AuthenticationResult = await this.msalApplication.acquireTokenSilent(
      this.silentAccountTokenRequest
    );

    return accessToken;
  }

  private getCDFScopes(): string[] {
    return [
      `https://${this.cluster}.cognitedata.com/user_impersonation`,
      `https://${this.cluster}.cognitedata.com/IDENTITY`,
    ];
  }

  private get loginPopupRequest(): PopupRequest {
    return {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
    };
  }

  private get loginRedirectRequest(): RedirectRequest {
    return {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
      redirectStartPage: window.location.href,
    };
  }

  private get silentCDFTokenRequest(): SilentRequest {
    return {
      account: this.account,
      scopes: this.getCDFScopes(),
    };
  }

  private get silentAccountTokenRequest(): SilentRequest {
    return {
      account: this.account,
      scopes: this.userScopes,
    };
  }

  private handleAuthAccountResult(
    authAccount: AccountInfo | null
  ): AccountInfo | void {
    const account = authAccount || this.getAccount();

    if (account) {
      this.account = account;
      this.setLocalAccountIdToLocalStorage(account.localAccountId);

      return account;
    }
  }

  private async handleAuthRedirect(): Promise<AccountInfo | null> {
    let redirectResult;
    try {
      redirectResult = await this.msalApplication.handleRedirectPromise();
    } catch (e) {
      console.error('Error while handling auth redirect', e);
    }

    return redirectResult && redirectResult.account
      ? redirectResult.account
      : null;
  }

  private setLocalAccountIdToLocalStorage(localId?: string): void {
    if (!localId) {
      localStorage.removeItem(accountLocalStorageKey);
    } else {
      localStorage.setItem(accountLocalStorageKey, localId);
    }
  }

  private getLocalAccountIdFromLocalStorage(): string | null {
    return localStorage.getItem(accountLocalStorageKey);
  }
}
