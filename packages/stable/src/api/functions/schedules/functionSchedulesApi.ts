// Copyright 2026 Cognite AS

import {
  BaseResourceAPI,
  type CogniteInternalId,
  type InternalId,
  type ItemsWrapper,
} from '@cognite/sdk-core';
import type { IgnoreUnknownIds } from '../../../types';
import type {
  FunctionSchedule,
  FunctionScheduleInputData,
  FunctionScheduleListQuery,
} from './types';

export class FunctionSchedulesAPI extends BaseResourceAPI<FunctionSchedule> {
  /**
   * [Filter function schedules](https://api-docs.cognite.com/20230101/tag/Function-schedules/operation/listFunctionSchedules)
   *
   * ```js
   * const schedules = await client.functions.schedules.list({
   *   filter: { functionId: 123 },
   *   limit: 10,
   * });
   * ```
   */
  public list = async (
    query: FunctionScheduleListQuery = {}
  ): Promise<FunctionSchedule[]> => {
    const response = await this.post<ItemsWrapper<FunctionSchedule[]>>(
      this.listPostUrl,
      { data: query }
    );
    return this.addToMapAndReturn(response.data.items, response);
  };

  /**
   * [Retrieve schedules](https://api-docs.cognite.com/20230101/tag/Function-schedules/operation/byIdsFunctionSchedules)
   *
   * ```js
   * const schedules = await client.functions.schedules.retrieve([{ id: 123 }]);
   * ```
   */
  public retrieve = (
    ids: InternalId[],
    params: IgnoreUnknownIds = {}
  ): Promise<FunctionSchedule[]> => {
    return this.retrieveEndpoint(ids, params);
  };

  /**
   * [Retrieve function input data](https://api-docs.cognite.com/20230101/tag/Function-schedules/operation/getFunctionScheduleInputData)
   *
   * ```js
   * const { data } = await client.functions.schedules.getInputData(123);
   * ```
   */
  public getInputData = async (
    id: CogniteInternalId
  ): Promise<FunctionScheduleInputData> => {
    const response = await this.get<FunctionScheduleInputData>(
      this.url(`${id}/input_data`)
    );
    return this.addToMapAndReturn(response.data, response);
  };
}
