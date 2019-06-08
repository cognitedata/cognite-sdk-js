// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { getIdInfo, IdInfo } from '../login';

export class LoginAPI {
  private instance: AxiosInstance;

  /** @hidden */
  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  /**
   * [Check login status](https://doc.cognitedata.com/api/v1/#operation/status)
   *
   * ```js
   * const status = await client.login.status();
   * // if status === null means you are not logged in
   * ```
   */
  public status: LoginStatusEndpoint = () => getIdInfo(this.instance, {});
}

export type LoginStatusEndpoint = () => Promise<null | IdInfo>;
