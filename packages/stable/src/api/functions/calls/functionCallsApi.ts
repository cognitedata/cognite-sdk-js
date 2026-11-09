// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteInternalId,
  type CursorAndAsyncIterator,
  type CursorResponse,
  type InternalId,
  type ItemsWrapper,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../../types';
import type {
  FunctionCall,
  FunctionCallFilterQuery,
  FunctionCallLogEntry,
  FunctionCallResponse,
} from './types';

export class FunctionCallsAPI extends BaseResourceAPI<FunctionCall> {
  /**
   * [Filter function calls](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/listFunctionCalls)
   *
   * ```js
   * const calls = await client.functions.calls
   *   .list(123, { filter: { status: 'Failed' } })
   *   .autoPagingToArray({ limit: 100 });
   * ```
   */
  public list = (
    functionId: CogniteInternalId,
    query?: FunctionCallFilterQuery
  ): CursorAndAsyncIterator<FunctionCall> => {
    const path = `${this.callsPath(functionId)}/list`;
    return this.listEndpoint(
      (data) =>
        this.post<CursorResponse<FunctionCall[]>>(path, { data: data || {} }),
      query
    );
  };

  /**
   * [Retrieve calls](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/byIdsFunctionCalls)
   *
   * ```js
   * const calls = await client.functions.calls.retrieve(123, [{ id: 456 }]);
   * ```
   */
  public retrieve = (
    functionId: CogniteInternalId,
    ids: InternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<FunctionCall[]> => {
    return this.retrieveEndpoint(
      ids,
      params,
      `${this.callsPath(functionId)}/byids`
    );
  };

  /**
   * [Retrieve response for function call](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/getFunctionCallResponse)
   *
   * ```js
   * const { response } = await client.functions.calls.getResponse(123, 456);
   * ```
   */
  public getResponse = async (
    functionId: CogniteInternalId,
    callId: CogniteInternalId
  ): Promise<FunctionCallResponse> => {
    const response = await this.get<FunctionCallResponse>(
      `${this.callsPath(functionId)}/${callId}/response`
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve logs for function call](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/getFunctionCallLogs)
   *
   * ```js
   * const logs = await client.functions.calls.getLogs(123, 456);
   * ```
   */
  public getLogs = async (
    functionId: CogniteInternalId,
    callId: CogniteInternalId
  ): Promise<FunctionCallLogEntry[]> => {
    const response = await this.get<ItemsWrapper<FunctionCallLogEntry[]>>(
      `${this.callsPath(functionId)}/${callId}/logs`
    );
    return this.addToMapAndReturn(response.data.items, response);
  };

  private callsPath(functionId: CogniteInternalId) {
    return this.url(`${functionId}/calls`);
  }
}
