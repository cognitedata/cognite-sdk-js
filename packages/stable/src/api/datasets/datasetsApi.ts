// Copyright 2020 Cognite AS

import { BaseResourceAPI, CursorAndAsyncIterator } from '@cognite/sdk-core';
import {
  DataSet,
  DataSetAggregate,
  DataSetAggregateQuery,
  DataSetChange,
  DataSetFilterRequest,
  ExternalDataSet,
  IdEither,
  IgnoreUnknownIds,
} from '../../types';

export class DataSetsAPI extends BaseResourceAPI<DataSet> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  /**
   * [Create datasets](https://docs.cognite.com/api/v1/#operation/createDataSets)
   *
   * ```js
   * const datasets = [
   *   { externalId: 'sensitiveData' },
   *   { writeProtected: true }
   * ];
   * const createdDatasets = await client.datasets.create(datasets);
   * ```
   */
  public create = (items: ExternalDataSet[]): Promise<DataSet[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List data sets](https://docs.cognite.com/api/v1/#operation/listDataSets)
   *
   * ```js
   * const dataSets = await client.datasets.list({ filter: { createdTime: { min: new Date('1 jan 2018'), max: new Date('1 jan 2019') }}});
   * ```
   */
  public list = (
    query?: DataSetFilterRequest
  ): CursorAndAsyncIterator<DataSet> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Aggregate datasets](https://docs.cognite.com/api/v1/#operation/aggregateDataSets)
   *
   * ```js
   * const aggregates = await client.datasets.aggregate({ filter: { writeProtected: true } });
   * console.log('Number of write protected datasets: ', aggregates[0].count)
   * ```
   */
  public aggregate = (
    query: DataSetAggregateQuery
  ): Promise<DataSetAggregate[]> => {
    return super.aggregateEndpoint(query);
  };

  /**
   * [Retrieve data sets](https://docs.cognite.com/api/v1/#operation/getDataSets)
   *
   * ```js
   * const dataSets = await client.datasets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (
    ids: IdEither[],
    params?: IgnoreUnknownIds
  ): Promise<DataSet[]> => {
    return super.retrieveEndpoint(ids, params);
  };

  /**
   * [Update data sets](https://docs.cognite.com/api/v1/#operation/updateDataSets)
   *
   * ```js
   * const dataSets = await client.datasets.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update = (changes: DataSetChange[]): Promise<DataSet[]> => {
    return super.updateEndpoint(changes);
  };
}
