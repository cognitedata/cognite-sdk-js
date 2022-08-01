// Copyright 2022 Cognite AS
import { User } from 'oidc-client-ts';
import { AuthContextProps } from 'react-oidc-context';
import { IAuth } from './auth-types';

abstract class AbstractAuth implements IAuth {

    constructor(protected authContext: AuthContextProps) {}

    /**
     * Login by selected method.
     * @param refresh_token? string
     * @returns Promise<AuthResponse>
     */
    abstract login(refresh_token?: string): Promise<User>;
}

export default AbstractAuth;
