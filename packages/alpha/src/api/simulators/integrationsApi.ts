// Copyright 2023 Cognite AS

import { BaseResourceAPI, type IdEither } from '@cognite/sdk-core';
import type {
  SimulatorIntegration,
  SimulatorIntegrationCreate,
  SimulatorIntegrationFilterQuery,
} from '../../types';

export class IntegrationsAPI extends BaseResourceAPI<SimulatorIntegration> {
  public create = async (items: SimulatorIntegrationCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorIntegrationFilterQuery) => {
    return this.listEndpoint<SimulatorIntegrationFilterQuery>(
      this.callListEndpointWithPost,
      filter,
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
