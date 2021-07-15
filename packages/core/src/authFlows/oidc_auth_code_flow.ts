// Copyright 2020 Cognite AS
import { LOCAL_STORAGE_PREFIX } from '../constants';
import { UserManager, WebStorageStateStore } from 'oidc-client';

export interface OIDCAuthFlowOptions {
  clientId: string;
  openIdConfigurationUrl: string;
  responseMode: string;
  responseType?: string;
  extraScope?: string;
  authenticateParams?: Record<string, any>;
  refreshParams?: Record<string, any>;
  loginParams?: Record<string, any>;
  interactionType?: 'REDIRECT' | 'POPUP';
}

const localStorageKey = `${LOCAL_STORAGE_PREFIX}oidAuthCodeRedirect`;

export class OidcAuthCode {
  private readonly userManager: UserManager;
  private readonly options: OIDCAuthFlowOptions;

  constructor(options: OIDCAuthFlowOptions) {
    this.options = options;
    const {
      openIdConfigurationUrl,
      clientId,
      responseMode,
      responseType = 'code',
      extraScope = '',
      authenticateParams,
    } = options;
    this.userManager = new UserManager({
      authority: openIdConfigurationUrl,
      client_id: clientId,
      response_mode: responseMode,
      response_type: responseType,

      scope: extraScope,
      extraQueryParams: authenticateParams,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      loadUserInfo: false,

      redirect_uri: `${window.location.protocol}//${window.location.host}`,
    });
  }

  public async init() {
    return this.userManager
      .signinRedirectCallback()
      .catch(e => {
        if (
          e.message === 'No state in response' ||
          e.message === 'No matching state found in storage'
        ) {
          return this.userManager.getUser().then(u => {
            if (u) {
              if (u.expired) {
                return this.userManager
                  .signinSilent(this.options.refreshParams)
                  .catch(() => Promise.resolve(null));
              } else {
                return Promise.resolve(u);
              }
            } else {
              return Promise.resolve(null);
            }
          });
        } else {
          throw e;
        }
      })
      .finally(() => {
        const redirectStateStr = window.localStorage.getItem(localStorageKey);
        if (redirectStateStr) {
          const { href, title, state } = JSON.parse(redirectStateStr);
          window.history.replaceState(state, title, href);
          window.localStorage.removeItem(localStorageKey);
        }
      });
  }

  public async getUser(fresh = false) {
    const user = await this.userManager.getUser();
    if (fresh || !user || user.expired) {
      return this.userManager.signinSilent(this.options.refreshParams);
    } else {
      return Promise.resolve(user);
    }
  }

  public async login() {
    const { interactionType = 'REDIRECT' } = this.options;
    switch (interactionType) {
      case 'REDIRECT': {
        localStorage.setItem(
          localStorageKey,
          JSON.stringify({
            href: window.location.href,
            state: window.history.state,
            title: window.document.title,
          })
        );
        await this.userManager.signinRedirect(this.options.loginParams);
        return Promise.resolve(null);
      }
      case 'POPUP': {
        return this.userManager.signinPopup();
      }
    }
  }
}
