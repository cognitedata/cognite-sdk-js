// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  DatapointsDeleteRequest,
  DatapointAggregates,
  Datapoints,
  DatapointsMultiQuery,
  IgnoreUnknownIds,
  ItemsWrapper,
  LatestDataBeforeRequest,
  ExternalDatapointsQuery,
  DatapointInfo,
  UnitConverterOptions,
} from '../../types';

import dataPointsUnitsConverter from '../utils/dataPointsUnitConverter';

export class DataPointsAPI extends BaseResourceAPI<
  DatapointAggregates | Datapoints
> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps<DatapointInfo>(
      ['items', 'datapoints'],
      ['timestamp']
    );
  }

  /**
   * [Insert data points](https://doc.cognitedata.com/api/v1/#operation/postMultiTimeSeriesDatapoints)
   *
   * ```js
   * await client.datapoints.insert([{ id: 123, datapoints: [{timestamp: 1557320284000, value: -2}] }]);
   * ```
   */
  public insert = (items: ExternalDatapointsQuery[]): Promise<{}> => {
    return this.insertEndpoint(items);
  };

  /**
   * [Retrieve data points](https://doc.cognitedata.com/api/v1/#operation/getMultiTimeSeriesDatapoints)
   *
   * ```js
   * const data = await client.datapoints.retrieve({ items: [{ id: 123 }] });
   * ```
   */
  public retrieve = (
    query: DatapointsMultiQuery,
    unitsConversionOptions?: UnitConverterOptions
  ): Promise<DatapointAggregates[] | Datapoints[]> => {
    if (!unitsConversionOptions) {
      return this.retrieveDatapointsEndpoint(query);
    }

    const retrievedDataPoints = this.retrieveDatapointsEndpoint(query);

    try {
      const convertedDataPoints = retrievedDataPoints.then((dataPointsData) =>
        dataPointsUnitsConverter(
          dataPointsData as Datapoints[],
          unitsConversionOptions
        )
      );

      return convertedDataPoints;
    } catch (e) {
      console.warn(
        `It wasn't possible to run units conversion. The retrieved data type for unit conversion must be Datapoints[]`
      );
    }

    return retrievedDataPoints;
  };

  /**
   * [Get latest data point in a time series](https://doc.cognitedata.com/api/v1/#operation/getLatest)
   *
   * ```js
   * const datapoints = await client.datapoints.retrieveLatest([
   *   {
   *    before: 'now',
   *    id: 123
   *  },
   *  {
   *    externalId: 'abc',
   *    before: new Date('21 jan 2018'),
   *  }
   * ]);
   * ```
   */
  public retrieveLatest = (
    items: LatestDataBeforeRequest[],
    params: LatestDataParams = {},
    unitsConversionOptions?: UnitConverterOptions
  ): Promise<Datapoints[]> => {
    if (!unitsConversionOptions) {
      return this.retrieveLatestEndpoint(items, params);
    }

    const retrievedDataPoints = this.retrieveLatestEndpoint(items, params);

    const convertedDataPoints = retrievedDataPoints.then((dataPointsData) =>
      dataPointsUnitsConverter(dataPointsData, unitsConversionOptions)
    );

    return convertedDataPoints;
  };

  /**
   * [Delete data points](https://doc.cognitedata.com/api/v1/#operation/deleteDatapoints)
   *
   * ```js
   * await client.datapoints.delete([{id: 123, inclusiveBegin: new Date('1 jan 2019')}]);
   * ```
   */
  public delete = (items: DatapointsDeleteRequest[]): Promise<{}> => {
    return this.deleteDatapointsEndpoint(items);
  };

  private async insertEndpoint(items: ExternalDatapointsQuery[]) {
    const path = this.url();
    await this.postInParallelWithAutomaticChunking({ path, items });
    return {};
  }

  private async retrieveDatapointsEndpoint(query: DatapointsMultiQuery) {
    const path = this.listPostUrl;
    const response = await this.post<
      ItemsWrapper<DatapointAggregates[] | Datapoints[]>
    >(path, {
      data: query,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async retrieveLatestEndpoint(
    items: LatestDataBeforeRequest[],
    params: LatestDataParams
  ) {
    const path = this.url('latest');
    const response = await this.post<ItemsWrapper<Datapoints[]>>(path, {
      data: { items, ...params },
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async deleteDatapointsEndpoint(items: DatapointsDeleteRequest[]) {
    await this.postInParallelWithAutomaticChunking({
      chunkSize: 10000,
      items,
      path: this.deleteUrl,
    });
    return {};
  }
}

export type LatestDataParams = IgnoreUnknownIds;
