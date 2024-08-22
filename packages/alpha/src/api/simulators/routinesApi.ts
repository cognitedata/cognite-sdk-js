// Copyright 2024 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  SimulatorRoutine,
  SimulatorRoutineCreate,
  SimulatorRoutineFilterQuery,
} from '../../types';

export class RoutinesAPI extends BaseResourceAPI<SimulatorRoutine> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  public create = async (items: SimulatorRoutineCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorRoutineFilterQuery) => {
    return this.listEndpoint<SimulatorRoutineFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
