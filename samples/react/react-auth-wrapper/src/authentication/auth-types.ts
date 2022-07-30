// Copyright 2022 Cognite AS
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

import { IToken } from './credentials-types';
import { AuthError } from './common';
import { User } from 'oidc-client-ts';

type AuthResponse = IToken | AuthError | undefined;

interface IAuth {
    login: () => Promise<User>;
}

interface IAuthRequest {
    request<T = unknown, U = unknown>(
        method: Method,
        endpoint: string,
        config?: AxiosRequestConfig,
        data?: T,
    ): Promise<AxiosResponse<U>>;
}

type AuthMethod = 'pkce';

export type {AuthResponse, AuthError, AuthMethod, IAuth, IAuthRequest}
