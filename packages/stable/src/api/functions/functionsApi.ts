import {
  BaseResourceAPI,
  CDFHttpClient,
  HttpResponse,
  MetadataMap,
} from "@cognite/sdk-core";
import {
  Function,
  FunctionCallRequest,
  FunctionIdEither,
  FunctionListResponse,
  FunctionListScope,
  FunctionsActivationResponse,
  FunctionsLimitsResponse,
  IgnoreUnknownIdsField,
  LimitList,
} from "./types.gen";
import { FunctionCallsApi } from "./functionCallsApi";

export class FunctionsAPI extends BaseResourceAPI<Function> {
  private readonly functionCallsAPI: FunctionCallsApi;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    console.log("baseUrl", baseUrl);
    this.functionCallsAPI = new FunctionCallsApi(baseUrl, httpClient, map);
  }

  public get calls() {
    return this.functionCallsAPI;
  }

  async list(scope?: LimitList): Promise<HttpResponse<FunctionListResponse>> {
    console.log("list", this.listPostUrl);
    return await this.post<FunctionListResponse>(this.listPostUrl, {
      data: scope || { limit: 100 }, // default limit
    });
  }

  async filter(
    scope?: FunctionListScope
  ): Promise<HttpResponse<FunctionListResponse>> {
    return await this.post<FunctionListResponse>(this.listPostUrl, {
      data: scope,
    });
  }

  async retrieve(
    scope?: IgnoreUnknownIdsField & { items: FunctionIdEither[] }
  ): Promise<HttpResponse<FunctionListResponse>> {
    return await this.post<FunctionListResponse>(this.byIdsUrl, {
      data: scope,
    });
  }

  /**
   * Retrieve a function by its id.
   * If you want to retrieve functions by names, use Retrieve functions instead.
   */
  async getById(scope: {
    functionId: number;
  }): Promise<HttpResponse<Function>> {
    return await this.get<Function>(this.url(scope.functionId.toString()));
  }

  /**
   * Get activation status
   */
  async status(): Promise<HttpResponse<FunctionsActivationResponse>> {
    return await this.get<FunctionsActivationResponse>(this.url("status"));
  }

  /**
   * Service limits for the associated project.
   * */
  async limits(): Promise<HttpResponse<FunctionsLimitsResponse>> {
    return await this.get<FunctionsLimitsResponse>(this.url("limits"));
  }

  /**
   * Activate Cognite Functions. This will create the necessary backend infrastructure for Cognite Functions.
   */
  async activate(): Promise<HttpResponse<FunctionsActivationResponse>> {
    return await this.post<FunctionsActivationResponse>(this.url("status"));
  }

  /**
   * Delete functions. You can delete a maximum of 10 functions per request.
   * Function source files stored in the Files API must be deleted separately.
   *
   * Example:
   * client.functions.delete({ items: { id: [1,2,3] } })
   */
  async delete(
    scope?: IgnoreUnknownIdsField & { items: FunctionIdEither[] }
  ): Promise<HttpResponse<void>> {
    return await this.post<void>(this.url("delete"), {
      data: scope,
    });
  }

  /**
   * Perform a function call. To provide input data to the function,
   * add the data in an object called data in the request body.
   *
   * It will be available as the data argument into the function.
   * Info about the function call at runtime can be obtained through
   * the function_call_info argument if added in the function handle.
   *
   * WARNING: Secrets or other confidential information
   * should not be passed via the data object.
   *
   * There is a dedicated secrets object in the request body
   * to "Create functions" for this purpose.
   * 
   * Example:
   * client.functions.call( 123, { nonce: 'generated-session-token', data: {} })

   */
  async call(functionId: number, request: FunctionCallRequest) {
    return this.functionCallsAPI.call(functionId, request);
  }
}
