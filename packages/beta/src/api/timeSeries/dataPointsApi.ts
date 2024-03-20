import {
  DataPointsAPI as DataPointsAPIStable,
  ItemsWrapper,
} from '@cognite/sdk';

import {
  DatapointsMultiQuery,
  DatapointAggregates,
  Datapoints,
} from '../../types';

export class DataPointsAPI extends DataPointsAPIStable {
  public retrieve = (
    query: DatapointsMultiQuery
  ): Promise<DatapointAggregates[] | Datapoints[]> => {
    return this.retrieveDatapointsEndpoint(query);
  };

  protected async retrieveDatapointsEndpoint<
    T extends DatapointAggregates[] | Datapoints[] =
      | DatapointAggregates[]
      | Datapoints[]
  >(query: DatapointsMultiQuery) {
    const path = this.listPostUrl;
    const response = await this.post<ItemsWrapper<T>>(path, {
      data: query,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }
}
