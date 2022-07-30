// Copyright 2022 Cognite AS
import { Express } from 'express';
import { Server } from 'http';

import ErrorHandler from '../core/errors/handler';

interface ISettings {
    authority: string;
    client_id: string;
    client_secret?: string;
    response_type?: string;
    grant_type?: string;
    scope?: string;
}

interface IRequestResponse {
    code: string;
    state: string;
    id_token?: string;
    session_state?: string;
}

interface IServer {
    app: Express;
    server: Server;
}

interface IOpenIdError {
    error: {
        type: string;
        value: string;
    };
}

type AuthError = IOpenIdError | ErrorHandler;

export type { ISettings, IRequestResponse, IServer, AuthError };
