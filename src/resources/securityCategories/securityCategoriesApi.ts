// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../../autoPagination';
import { MetadataMap } from '../../metadata';
import {
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
  private listEndpoint: SecurityCategoriesListEndpoint;
  private createEndpoint: SecurityCategoriesCreateEndpoint;
  private deleteEndpoint: SecurityCategoriesDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/securitycategories';
    this.listEndpoint = generateListEndpoint(instance, path, map, false);
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [List security categories](https://doc.cognitedata.com/api/v1/#operation/getSecurityCategories)
   *
   * ```js
   * const securityCategories = await client.securityCategories.list({ sort: 'ASC' });
   * ```
   */
  public list: SecurityCategoriesListEndpoint = query => {
    return this.listEndpoint(query);
  };

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
  public create: SecurityCategoriesCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [Delete security categories](https://doc.cognitedata.com/api/v1/#operation/deleteSecurityCategories)
   *
   * ```js
   * await client.securityCategories.delete([123, 456]);
   * ```
   */
  public delete: SecurityCategoriesDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };
}

export type SecurityCategoriesListEndpoint = (
  query?: ListSecurityCategories
) => CogniteAsyncIterator<SecurityCategory>;

export type SecurityCategoriesCreateEndpoint = (
  items: SecurityCategorySpec[]
) => Promise<SecurityCategory[]>;

export type SecurityCategoriesDeleteEndpoint = (
  ids: CogniteInternalId[]
) => Promise<{}>;
