import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import {
  SimulatorResource,
  SimulatorResourceCreate,
  SimulatorIntegrationCreate,
  SimulatorIntegrationFilterQuery,
  SimulatorResourceFilterQuery,
  SimulatorResourceChange,
} from 'beta/src/types';
import { IntegrationsAPI } from './integrationsApi';

export class SimulatorsAPI extends BaseResourceAPI<SimulatorResource> {
  private integrationsApi: IntegrationsAPI;
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [resourcePath, client, metadataMap] = args;

    this.integrationsApi = new IntegrationsAPI(
      `${resourcePath}/integrations`,
      client,
      metadataMap
    );
  }

  public create = async (items: SimulatorResourceCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorResourceFilterQuery) => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  public update = async (changes: SimulatorResourceChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = async (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };

  public listIntegrations = async (
    filter?: SimulatorIntegrationFilterQuery
  ) => {
    return this.integrationsApi.list(filter);
  };

  public createIntegrations = async (items: SimulatorIntegrationCreate[]) => {
    return this.integrationsApi.create(items);
  };

  public deleteIntegrations = async (ids: IdEither[]) => {
    return this.integrationsApi.delete(ids);
  };
}
