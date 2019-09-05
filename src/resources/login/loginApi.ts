// Copyright 2019 Cognite AS

import { MetadataMap } from '../../metadata';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';
import { getIdInfo, IdInfo } from '../login';

export class LoginAPI extends BaseResourceAPI<any> {
  /** @hidden */
  constructor(httpClient: CDFHttpClient, map: MetadataMap) {
    super('', httpClient, map);
  }

  /**
   * [Check login status](https://doc.cognitedata.com/api/v1/#operation/status)
   *
   * ```js
   * const status = await client.login.status();
   * // if status === null means you are not logged in
   * ```
   */
  public async status(): Promise<null | IdInfo> {
    return getIdInfo(this.httpClient, {});
  }
}
