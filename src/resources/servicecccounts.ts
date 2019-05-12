// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  ServiceAccount,
  ServiceAccountInput,
} from '../types/types';
import { projectUrl } from '../utils';

export interface ServiceaccountsAPI {
  /**
   * [List all service accounts](https://doc.cognitedata.com/api/v1/#operation/getServiceAccounts)
   *
   * ```js
   * const serviceaccounts = await client.serviceaccounts.list();
   * ```
   */
  list: () => Promise<ServiceAccount[]>;

  /**
   * [Create service accounts](https://doc.cognitedata.com/api/v1/#operation/createServiceAccounts)
   *
   * ```js
   * const serviceAccounts = [
   *   { name: 'Data extractor' },
   *   { name: 'Monitor', groups: [123, 456] },
   * ];
   * const createdServiceAccounts = await client.serviceaccounts.create(serviceAccounts);
   * ```
   */
  create: (items: ServiceAccountInput[]) => Promise<ServiceAccount[]>;

  /**
   * [Delete service accounts](https://doc.cognitedata.com/api/v1/#operation/deleteServiceAccounts)
   *
   * ```js
   * await client.serviceaccounts.delete([123, 456]);
   * ```
   */
  delete: (items: CogniteInternalId[]) => Promise<{}>;
}

/** @hidden */
export function generateServiceaccountsObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): ServiceaccountsAPI {
  const path = projectUrl(project) + '/serviceaccounts';
  return {
    list: generateListNoCursorEndpoint(instance, path, map),
    create: generateCreateEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
