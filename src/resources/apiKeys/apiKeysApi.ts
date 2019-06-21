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
  ApiKeyRequest,
  CogniteInternalId,
  NewApiKeyResponseDTO,
} from '../../types';
import { projectUrl } from '../../utils';

export class ApiKeysAPI {
  /**
   * [List all api keys](https://doc.cognitedata.com/api/v1/#operation/getApiKeys)
   *
   * ```js
   * const apiKeys = await client.apiKeys.list({ all: true });
   * ```
   */
  public list: ApiKeysListEndpoint;

  /**
   * [Create API keys](https://doc.cognitedata.com/api/v1/#operation/createApiKeys)
   *
   * ```js
   * const createdApiKeys = await client.apiKeys.create([{ serviceAccountId: 123 }]);
   * ```
   */
  public create: ApiKeysCreateEndpoint;

  /**
   * [Delete API keys](https://doc.cognitedata.com/api/v1/#operation/deleteApiKeys)
   *
   * ```js
   * await client.apiKeys.delete([123, 456]);
   * ```
   */
  public delete: ApiKeysDeleteEndpoint;

  /** @hidden */
  constructor(project: string, instance: AxiosInstance, map: MetadataMap) {
    const path = projectUrl(project) + '/apikeys';
    this.create = generateCreateEndpoint(instance, path, map);
    this.list = generateListNoCursorEndpointWithQueryParams(
      instance,
      path,
      map
    );
    this.delete = generateDeleteEndpoint(instance, path, map);
  }
}

export type ApiKeysListEndpoint = (
  scope?: ApiKeyListScope
) => Promise<NewApiKeyResponseDTO[]>;

export type ApiKeysCreateEndpoint = (
  items: ApiKeyRequest[]
) => Promise<NewApiKeyResponseDTO[]>;

export type ApiKeysDeleteEndpoint = (items: CogniteInternalId[]) => Promise<{}>;
