// Copyright 2020 Cognite AS

import {
  PublicClientApplication,
  SilentRequest,
  AuthenticationResult,
  Configuration,
  AccountInfo,
  InteractionRequiredAuthError,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
  LogLevel,
  BrowserSystemOptions,
  CacheOptions,
} from '@azure/msal-browser';
import noop from 'lodash/noop';

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
    this.setCluster(cluster);
  }

  setCluster(clusterName: string): void {
    this.cluster = clusterName;
  }

  getCluster(): string {
    return this.cluster;
  }

  /**
   * Calls getAllAccounts and determines the correct account to sign into,
   * currently defaults to first account found in cache.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
   */
  getAccount(): AccountInfo | null {
    const currentAccounts = this.msalApplication.getAllAccounts();
    if (currentAccounts && currentAccounts.length >= 1) {
      return currentAccounts[0];
    }

    return null;
  }

  /**
   * Gets the token to read user profile data silently, or falls back to interactive redirect.
   */
  async getProfileTokenRedirect(): Promise<void | AuthenticationResult> {
    return this.getTokenRedirect(
      this.silentProfileRequest,
      this.profileRedirectRequest
    );
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
          this.loginRequest
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

    this.account = undefined;
  }

  async getCDFToken(): Promise<string | null> {
    if (!this.account) return null;

    const response: AuthenticationResult = await this.msalApplication.acquireTokenSilent(
      this.silentCDFTokenRequest
    );

    return response.accessToken;
  }

  private getCDFScopes(): string[] {
    return [
      `https://${this.cluster}.cognitedata.com/user_impersonation`,
      `https://${this.cluster}.cognitedata.com/IDENTITY`,
    ];
  }

  private get loginRequest(): PopupRequest {
    return {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
    };
  }

  private get loginRedirectRequest(): RedirectRequest {
    return {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
      redirectStartPage: window.location.origin,
    };
  }

  private get profileRedirectRequest(): RedirectRequest {
    return {
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
      redirectStartPage: window.location.href,
    };
  }

  private get silentProfileRequest(): SilentRequest {
    return {
      account: this.account,
      scopes: this.userScopes,
      // forceRefresh: true,
    };
  }

  private get silentCDFTokenRequest(): SilentRequest {
    return {
      account: this.account,
      scopes: this.getCDFScopes(),
      // forceRefresh: true,
    };
  }

  private handleAuthAccountResult(
    authAccount: AccountInfo | null
  ): AccountInfo | void {
    const account = authAccount || this.getAccount();

    if (account) {
      this.account = account;

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

  /**
   * Gets a token silently, or falls back to interactive redirect.
   */
  private async getTokenRedirect(
    silentRequest: SilentRequest,
    interactiveRequest: RedirectRequest
  ): Promise<AuthenticationResult | void> {
    try {
      return await this.msalApplication.acquireTokenSilent(silentRequest);
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        return this.msalApplication
          .acquireTokenRedirect(interactiveRequest)
          .catch(noop);
      }
    }
  }
}
