// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '../../baseResourceApi';
import type { CDFHttpClient } from '../../httpClient/cdfHttpClient';
import { getLogoutUrl } from '../../loginUtils';
import type { MetadataMap } from '../../metadata';

export class LogoutApi extends BaseResourceAPI<unknown> {
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
  public getUrl = (
    options: { redirectUrl?: string } = {}
  ): Promise<string | null> => {
    return getLogoutUrl(this.get, options);
  };
}
