// Copyright 2024 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  SimulatorRoutineRevision,
  SimulatorRoutineRevisionslFilterQuery,
  SimulatorRoutineRevisionCreate,
} from '../../types';

export class RoutineRevisionsAPI extends BaseResourceAPI<SimulatorRoutineRevision> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SimulatorRoutineRevisionCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorRoutineRevisionslFilterQuery) => {
    return this.listEndpoint<SimulatorRoutineRevisionslFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
