// Copyright 2023 Cognite AS

import { BaseResourceAPI, type CogniteInternalId } from '@cognite/sdk-core';
import type {
  SimulationRun,
  SimulationRunCreate,
  SimulationRunFilterQuery,
} from '../../types';

export class SimulationRunsAPI extends BaseResourceAPI<SimulationRun> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      ['createdTime', 'lastUpdatedTime', 'runTime', 'simulationTime'],
    );
  }

  public run = async (items: SimulationRunCreate[]) => {
    const runUrl = this.url().slice(0, -2); // `/run` instead of `/runs`
    return this.createEndpoint(items, runUrl);
  };

  public list = async (filter?: SimulationRunFilterQuery) => {
    return this.listEndpoint<SimulationRunFilterQuery>(
      this.callListEndpointWithPost,
      filter,
    );
  };

  public retrieve = async (ids: CogniteInternalId[]) => {
    const items = ids.map((id) => ({ id }));
    return this.retrieveEndpoint(items);
  };
}
