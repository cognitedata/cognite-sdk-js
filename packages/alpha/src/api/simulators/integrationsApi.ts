// Copyright 2023 Cognite AS

import {
  BaseResourceAPI,
  CDFHttpClient,
  IdEither,
  MetadataMap,
} from '@cognite/sdk-core';
import {
  SimulatorIntegration,
  SimulatorIntegrationFilterQuery,
  SimulatorIntegrationCreate,
} from '../../types';

export class IntegrationsAPI extends BaseResourceAPI<SimulatorIntegration> {
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);
  }

  public create = async (items: SimulatorIntegrationCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorIntegrationFilterQuery) => {
    return this.listEndpoint<SimulatorIntegrationFilterQuery>(
      this.callListEndpointWithPost,
      filter
    );
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };
}
