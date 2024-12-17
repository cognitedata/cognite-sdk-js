// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type IdEither,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  SimulatorModelAggregate,
  SimulatorModel,
  SimulatorModelChange,
  SimulatorModelCreate,
  SimulatorModelFilterQuery,
  SimulatorModelAggregateQuery,
} from '../../types';

export class ModelsAPI extends BaseResourceAPI<SimulatorModel> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  public create = (items: SimulatorModelCreate[]) => {
    return this.createEndpoint(items);
  };

  public aggregate = (
    query: SimulatorModelAggregateQuery
  ): Promise<SimulatorModelAggregate[]> => {
    return this.aggregateEndpoint(query);
  };

  public list = (filter?: SimulatorModelFilterQuery) => {
    return this.listEndpoint<SimulatorModelFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public retrieve(items: IdEither[]) {
    return this.retrieveEndpoint(items);
  }

  public update = (changes: SimulatorModelChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
