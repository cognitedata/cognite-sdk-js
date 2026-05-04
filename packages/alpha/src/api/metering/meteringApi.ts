// Copyright 2026 Cognite AS

import { BaseResourceAPI, type ItemsResponse } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  MeterConsumptionFilterQuery,
  MeterConsumptionRangeParams,
  MeterReading,
  MeteringDatapoint,
} from '../../types';

export class MeteringAPI extends BaseResourceAPI<MeterReading> {
  protected get listPostUrl() {
    return this.url('meters/list');
  }

  protected get byIdsUrl() {
    return this.url('meters/byids');
  }

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<MeteringDatapoint>(
      ['items', 'datapoints'],
      ['timestamp']
    );
  }

  /**
   * [Filter meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/listConsumptionDataAdvanced)
   *
   * Only the `prefix` filter operator is supported (e.g. on `meterId`).
   * This method would be used to list all meters or filter meters by prefix.
   * @param query - Filter, cursor, limit, and optional historical range.
   */
  public retrieveMeters = (
    query?: MeterConsumptionFilterQuery
  ): CursorAndAsyncIterator<MeterReading> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve consumption data for multiple meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/fetchConsumptionDataByIds)
   *
   * Response shape matches the API: `{ items: MeterReading[] }`.
   * This method would be used to retrieve consumption data for single or multiple meters.
   * @param meterIds - Meter ids to fetch.
   * @param params - Optional time range and bucket count (epoch ms).
   */
  public retrieveConsumptionData = async (
    meterIds: string[],
    params?: MeterConsumptionRangeParams
  ): Promise<ItemsResponse<MeterReading>> => {
    const items = await this.retrieveEndpoint<
      MeterConsumptionRangeParams,
      { meterId: string }
    >(
      meterIds.map((meterId) => ({ meterId })),
      params,
      this.byIdsUrl
    );
    return { items };
  };
}
