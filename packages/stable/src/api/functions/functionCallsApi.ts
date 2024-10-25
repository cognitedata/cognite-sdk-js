import { BaseResourceAPI, type HttpResponse } from '@cognite/sdk-core';
import type {
  FunctionCall,
  FunctionCallListScope,
  FunctionCallListWithCursorResponse,
  FunctionCallLogResponse,
  FunctionCallRequest,
  FunctionCallResponse,
  FunctionCalledResponse,
} from './types.gen';

export class FunctionCallsApi extends BaseResourceAPI<FunctionCall> {
  /**
   * @hidden
   */
  async call(
    functionId: number,
    request: FunctionCallRequest
  ): Promise<HttpResponse<FunctionCalledResponse>> {
    return await this.post<FunctionCalledResponse>(
      this.url(`${functionId}/call`),
      {
        data: request,
      }
    );
  }

  /**
   * [List function calls](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/getFunctionCalls)
   *
   * ```js
   * client.functions.calls.list(123, { filter: { status: "Running"} } )
   * ```
   */
  async list(functionId: number, scope: FunctionCallListScope) {
    return await this.post<FunctionCallListWithCursorResponse>(
      this.url(`${functionId}/calls/list`),
      {
        data: scope,
      }
    );
  }

  /**
   * [Retrieve logs for function call](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/getFunctionCallLogs)
   *
   * ```js
   * client.functions.calls.logs("123", "456")
   * ```
   */
  async logs(callId: string, functionId: string) {
    return await this.get<FunctionCallLogResponse>(
      this.url(`${functionId}/calls/${callId}/logs`)
    );
  }

  /**
   * [Retrieve response from a function call](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/getFunctionCallResponse)
   *
   * ```js
   * client.functions.calls.response("123", "456")
   * ```
   */
  async response(callId: string, functionId: string) {
    return await this.get<FunctionCallResponse>(
      this.url(`${functionId}/calls/${callId}/response`)
    );
  }
}
