// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  SimulatorModel,
  SimulatorModelFilterQuery,
  SimulatorModelCreate,
  SimulatorModelChange,
} from '../../types';

export class ModelsAPI extends BaseResourceAPI<SimulatorModel> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      [
        'createdTime',
        'lastUpdatedTime',
      ]
    );
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
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

  public update = async (changes: SimulatorModelChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
