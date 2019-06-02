// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpoint,
} from '../../standardMethods';
import {
  CogniteInternalId,
  ServiceAccount,
  ServiceAccountInput,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class ServiceAccountsAPI {
  private listEndpoint: ServiceAccountsListEndpoint;
  private createEndpoint: ServiceAccountsCreateEndpoint;
  private deleteEndpoint: ServiceAccountsDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/serviceaccounts';
    this.listEndpoint = generateListNoCursorEndpoint(instance, path, map);
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [List all service accounts](https://doc.cognitedata.com/api/v1/#operation/getServiceAccounts)
   *
   * ```js
   * const serviceaccounts = await client.serviceAccounts.list();
   * ```
   */
  public list: ServiceAccountsListEndpoint = () => {
    return this.listEndpoint();
  };

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
  public create: ServiceAccountsCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [Delete service accounts](https://doc.cognitedata.com/api/v1/#operation/deleteServiceAccounts)
   *
   * ```js
   * await client.serviceAccounts.delete([123, 456]);
   * ```
   */
  public delete: ServiceAccountsDeleteEndpoint = items => {
    return this.deleteEndpoint(items);
  };
}

export type ServiceAccountsListEndpoint = () => Promise<ServiceAccount[]>;

export type ServiceAccountsCreateEndpoint = (
  items: ServiceAccountInput[]
) => Promise<ServiceAccount[]>;

export type ServiceAccountsDeleteEndpoint = (
  items: CogniteInternalId[]
) => Promise<{}>;
