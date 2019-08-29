// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '@/resources/baseResourceApi';
import {
  CogniteInternalId,
  ItemsResponse,
  ServiceAccount,
  ServiceAccountInput,
} from '@/types/types';

export class ServiceAccountsAPI extends BaseResourceAPI<ServiceAccount> {
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
  public async create(items: ServiceAccountInput[]): Promise<ServiceAccount[]> {
    return this.createEndpoint(items);
  }

  /**
   * [List all service accounts](https://doc.cognitedata.com/api/v1/#operation/getServiceAccounts)
   *
   * ```js
   * const serviceaccounts = await client.serviceAccounts.list();
   * ```
   */
  public async list(): Promise<ServiceAccount[]> {
    const path = this.url();
    const response = await this.httpClient.get<ItemsResponse<ServiceAccount[]>>(
      path
    );
    return this.addToMapAndReturn(response.data.items, response);
  }

  /**
   * [Delete service accounts](https://doc.cognitedata.com/api/v1/#operation/deleteServiceAccounts)
   *
   * ```js
   * await client.serviceAccounts.delete([123, 456]);
   * ```
   */
  public async delete(ids: CogniteInternalId[]): Promise<{}> {
    return super.deleteEndpoint(ids);
  }
}
