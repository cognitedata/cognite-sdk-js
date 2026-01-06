import {
  BaseResourceAPI,
  type CursorResponse,
  type FilterQuery,
} from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  LimitAdvanceFilter,
  LimitsValue,
} from '../../types';

export class LimitsAPI extends BaseResourceAPI<LimitsValue> {
  private header = {
    'cdf-version': '20230101-alpha',
  };

  /**
   * [Retrieve a single limit by ID](https://api-docs.cognite.com/20230101-alpha/tag/Limits/operation/fetchLimitById)
   *
   * @param limitId - The ID of the limit to retrieve.
   * @returns The limit value.
   */
  public retrieveByLimitId = async (limitId: string): Promise<LimitsValue> => {
    const path = this.url(`values/${encodeURIComponent(limitId)}`);
    const response = await this.get<LimitsValue>(path, {
      headers: this.header,
    });
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
    const path = this.url('values/list');

    const endpointCaller = async (query?: LimitAdvanceFilter) => {
      const requestBody = query || filter || {};
      const response = await this.post<CursorResponse<LimitsValue[]>>(path, {
        data: requestBody,
        headers: this.header,
      });
      return {
        ...response,
        data: {
          items: response.data.items || [],
          nextCursor: response.data?.nextCursor,
        },
      };
    };

    return this.listEndpoint(endpointCaller, filter);
  };

  /**
   * [Retrieve a list of all limits](https://api-docs.cognite.com/20230101-alpha/tag/Limits/operation/listLimits)
   *
   * @param queryparams - The query parameters to apply to the limits.
   * @returns The list of limits.
   */
  public getAllLimits = (
    queryparams?: FilterQuery
  ): CursorAndAsyncIterator<LimitsValue> => {
    const path = this.url('values');

    const endpointCaller = async (query?: FilterQuery) => {
      const queryParams = query || queryparams || {};
      const response = await this.get<CursorResponse<LimitsValue[]>>(path, {
        params: queryParams,
        headers: this.header,
      });
      return {
        ...response,
        data: {
          items: response.data.items || [],
          nextCursor: response.data?.nextCursor,
        },
      };
    };

    return this.listEndpoint(endpointCaller, queryparams);
  };
}
