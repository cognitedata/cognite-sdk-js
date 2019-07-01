// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  CursorAndAsyncIterator,
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListEndpoint,
} from '../../standardMethods';
import {
  CogniteInternalId,
  ListSecurityCategories,
  SecurityCategory,
  SecurityCategorySpec,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class SecurityCategoriesAPI {
  /**
   * [List security categories](https://doc.cognitedata.com/api/v1/#operation/getSecurityCategories)
   *
   * ```js
   * const securityCategories = await client.securityCategories.list({ sort: 'ASC' });
   * ```
   */
  public list: SecurityCategoriesListEndpoint;

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
  public create: SecurityCategoriesCreateEndpoint;

  /**
   * [Delete security categories](https://doc.cognitedata.com/api/v1/#operation/deleteSecurityCategories)
   *
   * ```js
   * await client.securityCategories.delete([123, 456]);
   * ```
   */
  public delete: SecurityCategoriesDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/securitycategories';
    this.list = generateListEndpoint<
      ListSecurityCategories,
      SecurityCategory,
      SecurityCategory
    >(instance, path, map, false, items => items);
    this.create = generateCreateEndpoint<
      SecurityCategorySpec,
      SecurityCategory,
      SecurityCategory
    >(instance, path, map, items => items);
    this.delete = generateDeleteEndpoint(instance, path, map);
  }
}

export type SecurityCategoriesListEndpoint = (
  query?: ListSecurityCategories
) => CursorAndAsyncIterator<SecurityCategory>;

export type SecurityCategoriesCreateEndpoint = (
  items: SecurityCategorySpec[]
) => Promise<SecurityCategory[]>;

export type SecurityCategoriesDeleteEndpoint = (
  ids: CogniteInternalId[]
) => Promise<{}>;
