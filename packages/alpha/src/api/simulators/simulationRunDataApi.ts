// Copyright 2023 Cognite AS

import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { SimulationRunData, SimulationRunId } from '../../types';

export class SimulationRunDataAPI extends BaseResourceAPI<SimulationRunData> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public retrieve = async (ids: SimulationRunId[]) => {
    const path = this.url('simulators/runs/data/list');

    return this.retrieveEndpoint(ids, {}, path);
  };
}
