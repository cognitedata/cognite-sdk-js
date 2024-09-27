import {
  BaseResourceAPI,
  type CDFHttpClient,
  type HttpResponse,
  type MetadataMap,
} from '@cognite/sdk-core';
import { FunctionCallsApi } from './functionCallsApi';
import type {
  Function as CogniteFunction,
  FunctionCallRequest,
  FunctionIdEither,
  FunctionListResponse,
  FunctionListScope,
  FunctionsActivationResponse,
  FunctionsLimitsResponse,
  IgnoreUnknownIdsField,
  LimitList,
} from './types.gen';

export class FunctionsAPI extends BaseResourceAPI<CogniteFunction> {
  private readonly functionCallsAPI: FunctionCallsApi;

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [baseUrl, httpClient, map] = args;
    this.functionCallsAPI = new FunctionCallsApi(baseUrl, httpClient, map);
  }

  /**
   * @hidden
   */
  public get calls() {
    return this.functionCallsAPI;
  }

  /**
   * [List functions](https://api-docs.cognite.com/20230101/tag/Functions/operation/getFunctions)
   *
   * ```js
   * client.functions.list({ limit: 100 })
   * ```
   *
   */
  async list(scope?: LimitList): Promise<HttpResponse<FunctionListResponse>> {
    return await this.post<FunctionListResponse>(this.listPostUrl, {
      data: scope || { limit: 100 }, // default limit
    });
  }

  /**
   * [Filter functions](https://api-docs.cognite.com/20230101/tag/Functions/operation/listFunctions)
   *
   * ```js
   * client.functions.filter({ filter: { name: 'test' } })
   * ```
   *
   */
  async filter(
    scope?: FunctionListScope
  ): Promise<HttpResponse<FunctionListResponse>> {
    return await this.post<FunctionListResponse>(this.listPostUrl, {
      data: scope,
    });
  }

  /**
   * [Retrieve functions](https://api-docs.cognite.com/20230101/tag/Functions/operation/byIdsFunctions)
   *
   * ```js
   * client.functions.retrieve({ items: [{ id: '123' }] })
   * ```
   *
   */
  async retrieve(
    scope?: IgnoreUnknownIdsField & { items: FunctionIdEither[] }
  ): Promise<HttpResponse<FunctionListResponse>> {
    return await this.post<FunctionListResponse>(this.byIdsUrl, {
      data: scope,
    });
  }

  /**
   * [Retrieve a function by its id](https://api-docs.cognite.com/20230101/tag/Functions/operation/getFunction)
   *
   * ```js
   * client.functions.getById({ functionId: 1 })
   * ```
   */
  async getById(scope: {
    functionId: number;
  }): Promise<HttpResponse<CogniteFunction>> {
    return await this.get<CogniteFunction>(
      this.url(scope.functionId.toString())
    );
  }

  /**
   * [Get activation status](https://api-docs.cognite.com/20230101/tag/Functions/operation/getFunctionsStatus)
   *
   * ```js
   * client.functions.status()
   * ```
   */
  async status(): Promise<HttpResponse<FunctionsActivationResponse>> {
    return await this.get<FunctionsActivationResponse>(this.url('status'));
  }

  /**
   * @hidden
   */
  async limits(): Promise<HttpResponse<FunctionsLimitsResponse>> {
    return await this.get<FunctionsLimitsResponse>(this.url('limits'));
  }

  /**
   * [Activate Cognite Functions](https://api-docs.cognite.com/20230101/tag/Functions/operation/postFunctionsStatus)
   *
   * ```js
   * client.functions.activate()
   * ```
   */
  async activate(): Promise<HttpResponse<FunctionsActivationResponse>> {
    return await this.post<FunctionsActivationResponse>(this.url('status'));
  }

  /**
   * [Delete functions](https://api-docs.cognite.com/20230101/tag/Functions/operation/deleteFunctions)
   *
   * ```js
   * client.functions.delete({ items: { id: [1,2,3] } })
   * ```
   */
  async delete(
    scope?: IgnoreUnknownIdsField & { items: FunctionIdEither[] }
  ): Promise<HttpResponse<void>> {
    return await this.post<void>(this.url('delete'), {
      data: scope,
    });
  }

  /**
   * [Call a function asynchronously](https://api-docs.cognite.com/20230101/tag/Function-calls/operation/postFunctionsCall)
   *
   * ```js
   * client.functions.call( 123, { nonce: 'generated-session-token', data: {} })
   * ```
   */
  async call(functionId: number, request: FunctionCallRequest) {
    return this.functionCallsAPI.call(functionId, request);
  }
}
