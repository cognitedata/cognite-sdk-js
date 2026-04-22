// Copyright 2026 Cognite AS

import { BaseResourceAPI, type CursorResponse } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  Datapoint,
  MeterConsumptionAdvancedFilter,
  MeterConsumptionByIdsRequest,
  MeterConsumptionByIdsResponse,
  MeterConsumptionListParams,
  MeterConsumptionRangeParams,
  MeterReading,
} from '../../types';

export class MeteringAPI extends BaseResourceAPI<MeterReading> {
  private header = {
    'cdf-version': '20230101-alpha',
  };

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<Datapoint>(
      ['items', 'datapoints'],
      ['timestamp']
    );
  }

  /**
   * [Retrieve consumption data by its id](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/fetchConsumptionDataById)
   *
   * Without `start` and `numberOfDatapoints`, returns meter metadata. With them (and optional `end`), returns averaged historical datapoints.
   *
   * @param meterId - Meter id, e.g. `atlas.monthly_ai_tokens`.
   * @param params - Optional time range and bucket count (epoch ms).
   */
  public retrieveByMeterId = async (
    meterId: string,
    params?: MeterConsumptionRangeParams
  ): Promise<MeterReading> => {
    const path = this.url(`meters/${encodeURIComponent(meterId)}`);
    const response = await this.get<MeterReading>(path, {
      params,
      headers: this.header,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List all meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/listConsumptionData)
   *
   * @param queryparams - Cursor, limit, and optional historical range (epoch ms).
   */
  public listMeters = (
    queryparams?: MeterConsumptionListParams
  ): CursorAndAsyncIterator<MeterReading> => {
    const path = this.url('meters');

    const endpointCaller = async (query?: MeterConsumptionListParams) => {
      const queryParams = query || queryparams || {};
      const response = await this.get<CursorResponse<MeterReading[]>>(path, {
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

  /**
   * [Filter meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/listConsumptionDataAdvanced)
   *
   * Only the `prefix` filter operator is supported (e.g. on `meterId`).
   *
   * @param filter - Filter, cursor, limit, and optional historical range.
   */
  public filterMeters = (
    filter?: MeterConsumptionAdvancedFilter
  ): CursorAndAsyncIterator<MeterReading> => {
    const path = this.url('meters/list');

    const endpointCaller = async (query?: MeterConsumptionAdvancedFilter) => {
      const requestBody = query || filter || {};
      const response = await this.post<CursorResponse<MeterReading[]>>(path, {
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
   * [Retrieve multiple consumption data by their ids](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/fetchConsumptionDataByIds)
   *
   * @param request - Meter ids and optional historical range (epoch ms).
   */
  public retrieveByMeterIds = async (
    request: MeterConsumptionByIdsRequest
  ): Promise<MeterConsumptionByIdsResponse> => {
    const path = this.url('meters/byids');
    const response = await this.post<MeterConsumptionByIdsResponse>(path, {
      data: request,
      headers: this.header,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}
