// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  type CDFHttpClient,
  type IdEither,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  SimulatorModel,
  SimulatorModelChange,
  SimulatorModelCreate,
  SimulatorModelFilterQuery,
} from '../../types';

export class ModelsAPI extends BaseResourceAPI<SimulatorModel> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  public create = async (items: SimulatorModelCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorModelFilterQuery) => {
    return this.listEndpoint<SimulatorModelFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public retrieve(items: IdEither[]) {
    return this.retrieveEndpoint(items);
  }

  public update = async (changes: SimulatorModelChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
