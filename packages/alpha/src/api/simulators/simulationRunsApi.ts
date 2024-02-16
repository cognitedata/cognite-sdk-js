// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  CogniteInternalId,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  SimulationRunCreate,
  SimulationRun,
  SimulationRunFilterQuery,
} from '../../types';

export class SimulationRunsAPI extends BaseResourceAPI<SimulationRun> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      ['createdTime', 'lastUpdatedTime', 'validationEndTime', 'simulationTime']
    );
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public run = async (items: SimulationRunCreate[]) => {
    const runUrl = this.url().slice(0, -2); // `/run` instead of `/runs`
    return this.createEndpoint(items, runUrl);
  };

  public list = async (filter?: SimulationRunFilterQuery) => {
    return this.listEndpoint<SimulationRunFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public retrieve = async (ids: CogniteInternalId[]) => {
    const items = ids.map((id) => ({ id }));
    return this.retrieveEndpoint(items);
  };
}
