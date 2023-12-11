// Copyright 2023 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import {
  SimulationRun,
  SimulationRunCreate,
  SimulationRunsFilterQuery,
} from '../../types';

export class SimulationRunsAPI extends BaseResourceAPI<SimulationRun> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SimulationRunCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulationRunsFilterQuery) => {
    return this.listEndpoint<SimulationRunsFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };
}
