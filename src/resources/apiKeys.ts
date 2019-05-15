// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { MetadataMap } from '../metadata';
import {
  generateCreateEndpoint,
  generateDeleteEndpoint,
  generateListNoCursorEndpointWithQueryParams,
} from '../standardMethods';
import {
  ApiKeyListScope,
  ApiKeyObject,
  ApiKeyRequest,
  CogniteInternalId,
  NewApiKeyResponse,
} from '../types/types';
import { projectUrl } from '../utils';

export interface ApiKeysAPI {
  /**
   * [List all api keys](https://doc.cognitedata.com/api/v1/#operation/getApiKeys)
   *
   * ```js
   * const apiKeys = await client.apiKeys.list({ all: true });
   * ```
   */
  list: (scope?: ApiKeyListScope) => Promise<ApiKeyObject[]>;

  /**
   * [Create API keys](https://doc.cognitedata.com/api/v1/#operation/createApiKeys)
   *
   * ```js
   * const createdApiKeys = await client.apiKeys.create([{ serviceAccountId: 123 }]);
   * ```
   */
  create: (items: ApiKeyRequest[]) => Promise<NewApiKeyResponse[]>;

  /**
   * [Delete API keys](https://doc.cognitedata.com/api/v1/#operation/deleteApiKeys)
   *
   * ```js
   * await client.apiKeys.delete([123, 456]);
   * ```
   */
  delete: (items: CogniteInternalId[]) => Promise<{}>;
}

/** @hidden */
export function generateApiKeysObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): ApiKeysAPI {
  const path = projectUrl(project) + '/apikeys';
  return {
    list: generateListNoCursorEndpointWithQueryParams(instance, path, map),
    create: generateCreateEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
  };
}
