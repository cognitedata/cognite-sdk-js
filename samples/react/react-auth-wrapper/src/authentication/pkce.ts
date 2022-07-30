// Copyright 2022 Cognite AS
import { AuthResponse } from './auth-types';
import { ISettings } from './common';
import AbstractAuth from './abstract-auth';
import { AuthContextProps } from 'react-oidc-context';
import { User } from 'oidc-client-ts';

class PkceAuth extends AbstractAuth {

    authResponse: AuthResponse;

    constructor(protected authContext: AuthContextProps) {
      super(authContext);
    }

    /**
     * Return an instance of PkceAuth class.
     * @returns new PkceAuth
     */
    static load(authContext: AuthContextProps) {
        return new this(authContext);
    }

    /**
     * Login by PKCE method and return access_token.
     * @param refresh_token? string
     * @returns Promise<AuthResponse>
     */
    async login(refresh_token?: string): Promise<User> {
        let user;

        if (!refresh_token) {
          user = await this.authContext.user;
        } else {
          user = await this.authContext.signinSilent();
        }

        if (!user) {
          throw new Error('Authentication did not return a user')
        }

        return user;
    }
}

export default PkceAuth;
