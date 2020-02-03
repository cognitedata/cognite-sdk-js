// Copyright 2019 Cognite AS

import { CursorAndAsyncIterator } from '../../autoPagination';
import { BaseResourceAPI } from '../../resources/baseResourceApi';
import { CogniteEvent, Dataset, DatasetFilterRequest, ExternalDataset } from '../../types/types';

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
   * [List datasets](https://docs.cognite.com/api/playground/#operation/listDataSets)
   * ```js
   * const datasets = await client.datasets.list({ filter: { createdTime: { min: new Date('1 jan 2018'), max: new Date('1 jan 2019') }}});
   * ```
   */
  public list = (
    query?: DatasetFilterRequest
  ): CursorAndAsyncIterator<CogniteEvent> => {
    return super.listEndpoint(this.callListEndpointWithPost, query);
  };
  //
  // /**
  //  * [Retrieve events](https://doc.cognitedata.com/api/v1/#operation/byIdsEvents)
  //  * <!-- or [similar](https://doc.cognitedata.com/api/v1/#operation/getEventByInternalId) -->
  //  *
  //  * ```js
  //  * const events = await client.events.retrieve([{id: 123}, {externalId: 'abc'}]);
  //  * ```
  //  */
  // public retrieve = (ids: IdEither[]) => {
  //   return super.retrieveEndpoint(ids);
  // };
  //
  // /**
  //  * [Update events](https://doc.cognitedata.com/api/v1/#operation/updateEvents)
  //  *
  //  * ```js
  //  * const events = await client.events.update([{id: 123, update: {description: {set: 'New description'}}}]);
  //  * ```
  //  */
  // public update = (changes: EventChange[]) => {
  //   return super.updateEndpoint(changes);
  // };
  //
  // /**
  //  * [Search for events](https://doc.cognitedata.com/api/v1/#operation/searchEvents)
  //  *
  //  * ```js
  //  * const events = await client.events.search({
  //  *   filter: {
  //  *     assetIds: [1, 2]
  //  *   },
  //  *   search: {
  //  *     description: 'Pump'
  //  *   }
  //  * });
  //  * ```
  //  */
  // public search = (query: EventSearchRequest) => {
  //   return super.searchEndpoint(query);
  // };
  //
  // /**
  //  * [Delete events](https://doc.cognitedata.com/api/v1/#operation/deleteEvents)
  //  *
  //  * ```js
  //  * await client.events.delete([{id: 123}, {externalId: 'abc'}]);
  //  * ```
  //  */
  // public delete = (ids: IdEither[]) => {
  //   return super.deleteEndpoint(ids);
  // };
}
