// Copyright 2019 Cognite AS

import { MetadataMap } from '../../metadata';
import { CDFHttpClient } from '../../utils/http/cdfHttpClient';
import { BaseResourceAPI } from '../baseResourceApi';
import { getLogoutUrl } from '../login';

export class LogoutApi extends BaseResourceAPI<any> {
  /** @hidden */
  constructor(httpClient: CDFHttpClient, map: MetadataMap) {
    super('', httpClient, map);
  }

  /**
   * [Retrieve a logout url](https://docs.cognite.com/api/v1/#operation/logoutUrl)
   *
   * ```js
   * // You can specify the url to send the user to after the logout is successful.
   * // If no url is passed, you will end up at the IDPs log out page.
   * const logoutUrl = await client.logout.getUrl({ redirectUrl: '[url to redirect]' });
   * ```
   */
  public getUrl = (options: { redirectUrl?: string } = {}) => {
    return getLogoutUrl(this.httpClient, options);
  };
}
