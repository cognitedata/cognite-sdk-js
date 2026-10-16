// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  type CursorAndAsyncIterator,
} from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  ListSecurityCategories,
  SecurityCategory,
  SecurityCategorySpec,
} from '../../types';

/**
 * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release. See https://docs.cognite.com/cdf/deprecated and https://github.com/cognitedata/cognite-sdk-js/blob/master/guides/DEPRECATIONS.md.
 */
export class SecurityCategoriesAPI extends BaseResourceAPI<SecurityCategory> {
  /**
   * [Create security categories](https://doc.cognitedata.com/api/v1/#operation/createSecurityCategories)
   *
   * ```js
   * const securityCategories = [
   *   { name: 'Admins' },
   *   { name: 'Developers' },
   * ];
   * const createdSecurityCategories = await client.securityCategories.create(securityCategories);
   * ```
   *
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
   */
  public create = (
    items: SecurityCategorySpec[]
  ): Promise<SecurityCategory[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List security categories](https://doc.cognitedata.com/api/v1/#operation/getSecurityCategories)
   *
   * ```js
   * const securityCategories = await client.securityCategories.list({ sort: 'ASC' });
   * ```
   *
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
   */
  public list = (
    query?: ListSecurityCategories
  ): CursorAndAsyncIterator<SecurityCategory> => {
    return super.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Delete security categories](https://doc.cognitedata.com/api/v1/#operation/deleteSecurityCategories)
   *
   * ```js
   * await client.securityCategories.delete([123, 456]);
   * ```
   *
   * @deprecated Asset-centric API, deprecated 2026-10-15 and retired 2027-12-31. Will be removed or moved in a future major release.
   */
  public delete = (ids: CogniteInternalId[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };
}
