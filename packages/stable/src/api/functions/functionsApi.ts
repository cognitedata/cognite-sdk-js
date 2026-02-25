// Copyright 2025 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { IdEither, ItemsWrapper } from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../types';
import type {
  CogniteFunction,
  ExternalCogniteFunctionItem,
  FunctionListScope,
  FunctionsActivationResponse,
  FunctionsLimits,
} from './types';

export class FunctionsAPI extends BaseResourceAPI<CogniteFunction> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime']);
  }

  /**
   * [Create functions](https://developer.cognite.com/api#tag/Functions/operation/postFunctions)
   *
   * ```js
   * const functions = await client.functions.create([{
   *   name: 'My awesome function',
   *   fileId: 5467347282343
   * }]);
   * ```
   */
  public create = (
    items: ExternalCogniteFunctionItem[]
  ): Promise<CogniteFunction[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List functions](https://developer.cognite.com/api#tag/Functions/operation/listFunctions)
   *
   * ```js
   * const functions = await client.functions.list();
   * ```
   */
  public list = async (
    scope?: FunctionListScope
  ): Promise<CogniteFunction[]> => {
    const response = await this.post<ItemsWrapper<CogniteFunction[]>>(
      this.listPostUrl,
      { data: scope || {} }
    );
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Retrieve a function by its ID](https://developer.cognite.com/api#tag/Functions/operation/getFunction)
   *
   * ```js
   * const func = await client.functions.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params: IgnoreUnknownIds = {}
  ): Promise<CogniteFunction[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Delete functions](https://developer.cognite.com/api#tag/Functions/operation/deleteFunctions)
   *
   * ```js
   * await client.functions.delete([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public delete = (ids: IdEither[], params: IgnoreUnknownIds = {}) => {
    return super.deleteEndpoint(ids, params);
  };

  /**
   * [Get functions limits](https://developer.cognite.com/api#tag/Functions/operation/functionsLimits)
   *
   * Returns the service limits for Cognite Functions.
   *
   * ```js
   * const limits = await client.functions.limits();
   * ```
   */
  public limits = async (): Promise<FunctionsLimits> => {
    const response = await this.get<FunctionsLimits>(this.url('limits'));
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Activate Cognite Functions](https://developer.cognite.com/api#tag/Functions/operation/postFunctionsStatus)
   *
   * Activate Cognite Functions for the project. This will create the necessary backend infrastructure.
   *
   * ```js
   * const status = await client.functions.activate();
   * ```
   */
  public activate = async (): Promise<FunctionsActivationResponse> => {
    const response = await this.post<FunctionsActivationResponse>(
      this.url('status')
    );
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Get activation status](https://developer.cognite.com/api#tag/Functions/operation/getFunctionsStatus)
   *
   * Get the activation status of Cognite Functions for the project.
   *
   * ```js
   * const status = await client.functions.status();
   * ```
   */
  public status = async (): Promise<FunctionsActivationResponse> => {
    const response = await this.get<FunctionsActivationResponse>(
      this.url('status')
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
