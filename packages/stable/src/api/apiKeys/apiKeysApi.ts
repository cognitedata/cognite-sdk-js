// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type {
  ApiKeyListScope,
  ApiKeyObject,
  ApiKeyRequest,
  CogniteInternalId,
  ItemsWrapper,
  NewApiKeyResponse,
} from '../../types';

export class ApiKeysAPI extends BaseResourceAPI<NewApiKeyResponse> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  /**
   * [Create API keys](https://doc.cognitedata.com/api/v1/#operation/createApiKeys)
   *
   * ```js
   * const createdApiKeys = await client.apiKeys.create([{ serviceAccountId: 123 }]);
   * ```
   */
  public create = (items: ApiKeyRequest[]): Promise<NewApiKeyResponse[]> => {
    return this.createEndpoint(items);
  };

  /**
   * [List all api keys](https://doc.cognitedata.com/api/v1/#operation/getApiKeys)
   *
   * ```js
   * const apiKeys = await client.apiKeys.list({ all: true });
   * ```
   */
  public list = async (scope?: ApiKeyListScope): Promise<ApiKeyObject[]> => {
    const path = this.url();
    const response = await this.get<ItemsWrapper<ApiKeyObject[]>>(path, {
      params: scope,
    });
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Delete API keys](https://doc.cognitedata.com/api/v1/#operation/deleteApiKeys)
   *
   * ```js
   * await client.apiKeys.delete([123, 456]);
   * ```
   */
  public delete = (ids: CogniteInternalId[]): Promise<object> => {
    return super.deleteEndpoint(ids);
  };
}
