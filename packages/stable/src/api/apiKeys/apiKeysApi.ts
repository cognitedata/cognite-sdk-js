// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  ApiKeyListScope,
  ApiKeyObject,
  ApiKeyRequest,
  CogniteInternalId,
  ItemsWrapper,
  NewApiKeyResponse,
  DatePropFilter,
} from '../../types';

export class ApiKeysAPI extends BaseResourceAPI<NewApiKeyResponse> {
  /**
   * Specify what fields in json responses should be parsed as Dates
   * @hidden
   */
  protected getDateProps(): DatePropFilter {
    return [['items'], ['createdTime']];
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
  public delete = (ids: CogniteInternalId[]): Promise<{}> => {
    return super.deleteEndpoint(ids);
  };
}
