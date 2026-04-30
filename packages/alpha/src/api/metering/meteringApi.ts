// Copyright 2026 Cognite AS

import { BaseResourceAPI, type ItemsResponse } from '@cognite/sdk-core';
import type {
  CursorAndAsyncIterator,
  MeterConsumptionFilterQuery,
  MeterConsumptionListParams,
  MeterConsumptionRangeParams,
  MeterReading,
  MeteringDatapoint,
} from '../../types';

export class MeteringAPI extends BaseResourceAPI<MeterReading> {
  protected get listGetUrl() {
    return this.url('meters');
  }

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
   * [Retrieve consumption data by its id](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/fetchConsumptionDataById)
   *
   * Returns a **meter reading** for the meter (consumption snapshot). Naming uses “consumption” to match the Metering API operations (`fetchConsumptionData*`).
   *
   * Without `start` and `numberOfDatapoints`, returns meter metadata. With them (and optional `end`), returns averaged historical datapoints.
   *
   * @param meterId - Meter id, e.g. `atlas.monthly_ai_tokens`.
   * @param params - Optional time range and bucket count (epoch ms).
   */
  public retrieveConsumptionData = async (
    meterId: string,
    params?: MeterConsumptionRangeParams
  ): Promise<MeterReading> => {
    const path = this.url(`meters/${encodeURIComponent(meterId)}`);
    const response = await this.get<MeterReading>(path, {
      params,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [List all meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/listConsumptionData)
   *
   * @param query - Cursor, limit, and optional historical range (epoch ms).
   */
  public listMeters = (
    query?: MeterConsumptionListParams
  ): CursorAndAsyncIterator<MeterReading> => {
    return this.listEndpoint(this.callListEndpointWithGet, query);
  };

  /**
   * [Filter meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/listConsumptionDataAdvanced)
   *
   * Only the `prefix` filter operator is supported (e.g. on `meterId`).
   *
   * @param query - Filter, cursor, limit, and optional historical range.
   */
  public filterMeters = (
    query?: MeterConsumptionFilterQuery
  ): CursorAndAsyncIterator<MeterReading> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve consumption data for multiple meters](https://api-docs.cognite.com/20230101-alpha/tag/Metering/operation/fetchConsumptionDataByIds)
   *
   * Response shape matches the API: `{ items: MeterReading[] }`.
   *
   * @param meterIds - Meter ids to fetch.
   * @param params - Optional time range and bucket count (epoch ms).
   */
  public retrieveConsumptionDataByIds = async (
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
