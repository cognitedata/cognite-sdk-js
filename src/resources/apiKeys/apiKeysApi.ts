// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpointWithQueryParams,
} from '../../standardMethods';
import {
  ApiKeyListScope,
  ApiKeyObject,
  ApiKeyRequest,
  CogniteInternalId,
  NewApiKeyResponse,
} from '../../types/types';
import { projectUrl } from '../../utils';

export class ApiKeysAPI {
  private listEndpoint: ApiKeysListEndpoint;
  private createEndpoint: ApiKeysCreateEndpoint;
  private deleteEndpoint: ApiKeysDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/apikeys';
    this.createEndpoint = generateCreateEndpoint(instance, path, map);
    this.listEndpoint = generateListNoCursorEndpointWithQueryParams(
      instance,
      path,
      map
    );
    this.deleteEndpoint = generateDeleteEndpoint(instance, path, map);
  }

  /**
   * [Create API keys](https://doc.cognitedata.com/api/v1/#operation/createApiKeys)
   *
   * ```js
   * const createdApiKeys = await client.apiKeys.create([{ serviceAccountId: 123 }]);
   * ```
   */
  public create: ApiKeysCreateEndpoint = items => {
    return this.createEndpoint(items);
  };

  /**
   * [List all api keys](https://doc.cognitedata.com/api/v1/#operation/getApiKeys)
   *
   * ```js
   * const apiKeys = await client.apiKeys.list({ all: true });
   * ```
   */
  public list: ApiKeysListEndpoint = scope => {
    return this.listEndpoint(scope);
  };

  /**
   * [Delete API keys](https://doc.cognitedata.com/api/v1/#operation/deleteApiKeys)
   *
   * ```js
   * await client.apiKeys.delete([123, 456]);
   * ```
   */
  public delete: ApiKeysDeleteEndpoint = ids => {
    return this.deleteEndpoint(ids);
  };
}

export type ApiKeysListEndpoint = (
  scope?: ApiKeyListScope
) => Promise<ApiKeyObject[]>;

export type ApiKeysCreateEndpoint = (
  items: ApiKeyRequest[]
) => Promise<NewApiKeyResponse[]>;

export type ApiKeysDeleteEndpoint = (items: CogniteInternalId[]) => Promise<{}>;
