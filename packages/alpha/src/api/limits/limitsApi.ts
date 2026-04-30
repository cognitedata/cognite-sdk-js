import { BaseResourceAPI, type FilterQuery } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  LimitAdvanceFilter,
  LimitsValue,
} from '../../types';

export class LimitsAPI extends BaseResourceAPI<LimitsValue> {
  protected get listGetUrl() {
    return this.url('values');
  }

  protected get listPostUrl() {
    return this.url('values/list');
  }

  /**
   * [Retrieve a single limit by ID](https://api-docs.cognite.com/20230101-alpha/tag/Limits/operation/fetchLimitById)
   *
   * @param limitId - The ID of the limit to retrieve.
   * @returns The limit value.
   */
  public retrieveByLimitId = async (limitId: string): Promise<LimitsValue> => {
    const path = this.url(`values/${encodeURIComponent(limitId)}`);
    const response = await this.get<LimitsValue>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve a list of limits with advanced filter](https://api-docs.cognite.com/20230101-alpha/tag/Limits/operation/listLimitsAdvanced)
   *
   * @param filter - The filter to apply to the limits.
   * @returns The list of limits.
   */
  public retrieveByAdvancedFilter = (
    filter?: LimitAdvanceFilter
  ): CursorAndAsyncIterator<LimitsValue> => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  /**
   * [Retrieve a list of all limits](https://api-docs.cognite.com/20230101-alpha/tag/Limits/operation/listLimits)
   *
   * @param query - The query parameters to apply to the limits.
   * @returns The list of limits.
   */
  public getAllLimits = (
    query?: FilterQuery
  ): CursorAndAsyncIterator<LimitsValue> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };
}
