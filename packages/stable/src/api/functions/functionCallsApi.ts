import {
  BaseResourceAPI,
  CursorResponse,
  HttpResponse,
} from "@cognite/sdk-core";
import {
  FunctionCall,
  FunctionCalledResponse,
  FunctionCallListScope,
  FunctionCallListWithCursorResponse,
  FunctionCallLogResponse,
  FunctionCallRequest,
  FunctionCallResponse,
} from "./types.gen";

export class FunctionCallsApi extends BaseResourceAPI<FunctionCall> {
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
   * Use advanced filtering options to find function calls.
   * 
   * client.functions.calls.list(123, { filter: { status: "Running"} } )
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
   * Get logs from a function call.
   */
  async logs(callId: string, functionId: string) {
    return await this.get<FunctionCallLogResponse>(
      this.url(`${functionId}/calls/${callId}/logs`)
    );
  }

  /**
   * Retrieve response from a function call.
   */
  async response(callId: string, functionId: string) {
    return await this.get<FunctionCallResponse>(
      this.url(`${functionId}/calls/${callId}/response`)
    );
  }

}
