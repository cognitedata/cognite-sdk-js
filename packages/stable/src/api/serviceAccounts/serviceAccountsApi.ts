// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  CogniteInternalId,
  ItemsWrapper,
  ServiceAccount,
  ServiceAccountInput,
} from '../../types';

export class ServiceAccountsAPI extends BaseResourceAPI<ServiceAccount> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['deletedTime']);
  }

  /**
   * [Create service accounts](https://doc.cognitedata.com/api/v1/#operation/createServiceAccounts)
   *
   * ```js
   * const serviceAccounts = [
   *   { name: 'Data extractor' },
   *   { name: 'Monitor', groups: [123, 456] },
   * ];
   * const createdServiceAccounts = await client.serviceAccounts.create(serviceAccounts);
   * ```
   */
  public create = (items: ServiceAccountInput[]): Promise<ServiceAccount[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List all service accounts](https://doc.cognitedata.com/api/v1/#operation/getServiceAccounts)
   *
   * ```js
   * const serviceaccounts = await client.serviceAccounts.list();
   * ```
   */
  public list = async (): Promise<ServiceAccount[]> => {
    const path = this.url();
    const response = await this.get<ItemsWrapper<ServiceAccount[]>>(path);
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Delete service accounts](https://doc.cognitedata.com/api/v1/#operation/deleteServiceAccounts)
   *
   * ```js
   * await client.serviceAccounts.delete([123, 456]);
   * ```
   */
  public delete = (ids: CogniteInternalId[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };
}
