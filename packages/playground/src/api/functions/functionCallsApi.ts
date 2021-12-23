import { CogniteInternalId } from '@cognite/sdk';
import {
  BaseResourceAPI,
  CursorResponse,
  ItemsResponse,
} from '@cognite/sdk-core';
import {
  FunctionCall,
  FunctionCallFilter,
  FunctionId,
  FunctionCallResponse,
  FunctionCallLogEntry,
} from '../../types';

export class FunctionCallsApi extends BaseResourceAPI<FunctionCall> {
  public retrieve = async (
    functionId: CogniteInternalId,
    ids: CogniteInternalId[]
  ) => {
    const path = this.url(`${functionId}/calls/byids`);
    return this.callEndpointWithMergeAndTransform(
      ids.map((id) => ({ id })),
      (request) => this.callRetrieveEndpoint(request, path)
    );
  };

  public callFunction = async (
    functionId: FunctionId,
    data?: any,
    nonce?: string
  ) => {
    const response = await this.post<FunctionCall>(
      this.url(`${functionId}/call`),
      {
        data: { data, nonce },
      }
    );
    return response.data;
  };

  public list = async (
    functionId: CogniteInternalId,
    filter?: FunctionCallFilter,
    limit?: number,
    cursor?: string
  ) => {
    const path = this.url(`${functionId}/calls/list`);
    return this.listEndpoint(
      async (params) =>
        this.post<CursorResponse<FunctionCall[]>>(path, { data: params }),
      { filter, limit, cursor }
    );
  };

  public retrieveLogs = async (
    functionId: CogniteInternalId,
    callId: CogniteInternalId
  ) => {
    const response = await this.get<ItemsResponse<FunctionCallLogEntry>>(
      this.url(`${functionId}/calls/${callId}/logs`)
    );
    return response.data;
  };

  public retrieveResponse = async (
    functionId: CogniteInternalId,
    callId: CogniteInternalId
  ) => {
    const response = await this.get<FunctionCallResponse>(
      this.url(`${functionId}/calls/${callId}/response`)
    );
    return response.data;
  };
}
