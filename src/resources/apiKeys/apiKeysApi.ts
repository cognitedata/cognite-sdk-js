// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '@/resources/baseResourceApi';
import {
  ApiKeyListScope,
  ApiKeyObject,
  ApiKeyRequest,
  CogniteInternalId,
  ItemsResponse,
  NewApiKeyResponse,
} from '@/types/types';

export class ApiKeysAPI extends BaseResourceAPI<NewApiKeyResponse> {
  /**
   * [Create API keys](https://doc.cognitedata.com/api/v1/#operation/createApiKeys)
   *
   * ```js
   * const createdApiKeys = await client.apiKeys.create([{ serviceAccountId: 123 }]);
   * ```
   */
  public async create(items: ApiKeyRequest[]): Promise<NewApiKeyResponse[]> {
    return this.createEndpoint(items);
  }

  /**
   * [List all api keys](https://doc.cognitedata.com/api/v1/#operation/getApiKeys)
   *
   * ```js
   * const apiKeys = await client.apiKeys.list({ all: true });
   * ```
   */
  public async list(scope?: ApiKeyListScope): Promise<ApiKeyObject[]> {
    const path = this.url();
    const response = await this.httpClient.get<ItemsResponse<ApiKeyObject[]>>(
      path,
      { params: scope }
    );
    return this.addToMapAndReturn(response.data.items, response);
  }

  /**
   * [Delete API keys](https://doc.cognitedata.com/api/v1/#operation/deleteApiKeys)
   *
   * ```js
   * await client.apiKeys.delete([123, 456]);
   * ```
   */
  public async delete(ids: CogniteInternalId[]): Promise<{}> {
    return super.deleteEndpoint(ids);
  }
}
