// Copyright 2024 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  SimulatorRoutineRevision,
  SimulatorRoutineRevisionCreate,
  SimulatorRoutineRevisionslFilterQuery,
} from '../../types';

export class RoutineRevisionsAPI extends BaseResourceAPI<SimulatorRoutineRevision> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  public create = async (items: SimulatorRoutineRevisionCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorRoutineRevisionslFilterQuery) => {
    return this.listEndpoint<SimulatorRoutineRevisionslFilterQuery>(
      this.callListEndpointWithPost,
      filter,
    );
  };

  public retrieve(items: IdEither[]) {
    return this.retrieveEndpoint(items);
  }

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
