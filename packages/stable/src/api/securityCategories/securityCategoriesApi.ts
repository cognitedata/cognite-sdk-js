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
   */
  public delete = (ids: CogniteInternalId[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };
}
