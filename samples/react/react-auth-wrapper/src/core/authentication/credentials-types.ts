// Copyright 2022 Cognite AS
interface IToken {
    access_token?: string;
    token_type?: string;
    id_token?: string;
    refresh_token?: string;
    scope?: string;
    expires_at?: number;
    session_state?: string;
    [key: string]: unknown;
}

interface IGrantBody {
    grant_type: string;
    code?: string;
    code_verifier?: string;
    [key: string]: unknown;
}

interface IClaimsParameterMember {
    essential?: boolean;
    value?: string;
    values?: string[];

    [key: string]: unknown;
}

interface IAuthorizationParameters {
    acr_values?: string;
    audience?: string;
    claims?:
        | string
        | {
              id_token?: {
                  [key: string]: null | IClaimsParameterMember;
              };
              userinfo?: {
                  [key: string]: null | IClaimsParameterMember;
              };
          };
    claims_locales?: string;
    client_id?: string;
    code_challenge_method?: string;
    code_challenge?: string;
    display?: string;
    id_token_hint?: string;
    login_hint?: string;
    max_age?: number;
    nonce?: string;
    prompt?: string;
    redirect_uri?: string;
    registration?: string;
    request_uri?: string;
    request?: string;
    resource?: string | string[];
    response_mode?: string;
    response_type?: string;
    scope?: string;
    state?: string;
    ui_locales?: string;

    [key: string]: unknown;
}

interface IDeviceAuthorize {
    client_id: string;
    scope: string;
}

interface IDeviceResponse {
    device_code: string;
    user_code: string;
    expires_in: number;
    interval: number;
    verification_uri: string;
    verification_url?: string;
}

interface IClient {
    authorizationUrl: (
        parameters?: IAuthorizationParameters
    ) => Promise<string>;
    grant: (body: IGrantBody) => Promise<IToken>;
    deviceAuthorization: () => Promise<IDeviceResponse>;
}

export type {
    IToken,
    IGrantBody,
    IClient,
    IAuthorizationParameters,
    IDeviceAuthorize,
    IDeviceResponse,
};
