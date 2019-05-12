// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  ListSecurityCategories,
  SecurityCategory,
  SecurityCategorySpec,
} from '../types/types';
import { projectUrl } from '../utils';

export interface SecurityCategoriesAPI {
  /**
   * [List security categories](https://doc.cognitedata.com/api/v1/#operation/getSecurityCategories)
   *
   * ```js
   * const securityCategories = await client.securitycategories.list({ sort: 'ASC' });
   * ```
   */
  list: (
    query?: ListSecurityCategories
  ) => CogniteAsyncIterator<SecurityCategory>;

  /**
   * [Create security categories](https://doc.cognitedata.com/api/v1/#operation/createSecurityCategories)
   *
   * ```js
   * const securityCategories = [
   *   { name: 'Admins' },
   *   { name: 'Developers' },
   * ];
   * const createdSecurityCategories = await client.securitycategories.create(securityCategories);
   * ```
   */
  create: (items: SecurityCategorySpec[]) => Promise<SecurityCategory[]>;

  /**
   * [Delete security categories](https://doc.cognitedata.com/api/v1/#operation/deleteSecurityCategories)
   *
   * ```js
   * await client.securitycategories.delete([123, 456]);
   */
  delete: (ids: CogniteInternalId[]) => Promise<{}>;
}

/** @hidden */
export function generateSecuritycategoryObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): SecurityCategoriesAPI {
  const path = projectUrl(project) + '/securitycategories';
  return {
    create: generateCreateEndpoint(instance, path, map),
    list: generateListEndpoint(instance, path, map, false),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
