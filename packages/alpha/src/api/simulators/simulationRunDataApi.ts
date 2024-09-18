// Copyright 2023 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import type { SimulationRunData, SimulationRunId } from '../../types';

export class SimulationRunDataAPI extends BaseResourceAPI<SimulationRunData> {
  public retrieve = async (ids: SimulationRunId[]) => {
    const path = this.url('list');

    return this.retrieveEndpoint(ids, {}, path);
  };
}
