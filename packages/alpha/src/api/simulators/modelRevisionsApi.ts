// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  SimulatorModelRevision,
  SimulatorModelRevisionCreate,
  SimulatorModelRevisionFilterQuery,
  SimulatorModelRevisionChange,
} from '../../types';

export class ModelRevisionsAPI extends BaseResourceAPI<SimulatorModelRevision> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SimulatorModelRevisionCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorModelRevisionFilterQuery) => {
    return this.listEndpoint<SimulatorModelRevisionFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public update = async (changes: SimulatorModelRevisionChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
