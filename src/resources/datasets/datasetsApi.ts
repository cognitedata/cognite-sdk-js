// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import {
  Dataset,
  DatasetChange,
  DatasetFilterRequest,
  ExternalDataset,
  IdEither,
} from '../../types/types';
import { BaseResourceAPI } from '../baseResourceApi';

export class DatasetsApi extends BaseResourceAPI<Dataset> {
  /**
   * [Create datasets](https://docs.cognite.com/api/v1/#operation/createDataSets)
   *
   * ```js
   * const datasets = [
   *   {externalId: 'sensitiveData'},
   *   {writeProtected: true}
   * ];
   * const createdDatasets = await client.datasets.create(datasets);
   * ```
   */
  public create = (items: ExternalDataset[]): Promise<Dataset[]> => {
    return super.createEndpoint(items);
  };

  /**
   * [List datasets](https://docs.cognite.com/api/v1/#operation/listDataSets)
   * ```js
   * const datasets = await client.datasets.list({ filter: { createdTime: { min: new Date('1 jan 2018'), max: new Date('1 jan 2019') }}});
   * ```
   */
  public list = (
    query?: DatasetFilterRequest
  ): CursorAndAsyncIterator<Dataset> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };

  /**
   * [Retrieve datasets](https://docs.cognite.com/api/v1/#operation/getDataSets)
   *
   * ```js
   * const datasets = await client.datasets.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  public retrieve = (ids: IdEither[]): Promise<Dataset[]> => {
    return super.retrieveEndpoint(ids);
  };

  /**
   * [Update datasets](https://docs.cognite.com/api/v1/#operation/updateDataSets)
   *
   * ```js
   * const datasets = await client.datasets.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  public update = (changes: DatasetChange[]): Promise<Dataset[]> => {
    return super.updateEndpoint(changes);
  };
}
