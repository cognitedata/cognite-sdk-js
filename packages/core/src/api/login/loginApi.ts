// Copyright 2020 Cognite AS

import { type IdInfo, getIdInfo } from '../../authFlows/legacy';
import { BaseResourceAPI } from '../../baseResourceApi';
import type { CDFHttpClient } from '../../httpClient/cdfHttpClient';
import type { MetadataMap } from '../../metadata';

export class LoginAPI extends BaseResourceAPI<unknown> {
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
  public status = (): Promise<null | IdInfo> => {
    return getIdInfo(this.get, {});
  };
}
