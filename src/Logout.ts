// Copyright 2018 Cognite AS

import { AxiosResponse } from 'axios';
import { rawGet } from './core';
import { LoginStatus, LoginStatusResponse, LoginUrlResponse } from './Login';

interface LogoutRetriveveUrlParams {
  redirectUrl: string;
}

/**
 * @hidden
 */
const logoutUrl = (): string => `/logout`;

export class Logout {
  public static async retrieveLogoutUrl(
    params: LogoutRetriveveUrlParams
  ): Promise<string> {
    const url = `${logoutUrl()}/url`;
    const response = (await rawGet(url, { params })) as AxiosResponse<
      LoginUrlResponse
    >;
    return response.data.data.url;
  }

  public static async logout(): Promise<LoginStatus> {
    const url = logoutUrl();
    const response = (await rawGet(url)) as AxiosResponse<LoginStatusResponse>;
    return response.data.data;
  }
}
