import { BaseResourceAPI, CDFHttpClient, MetadataMap } from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import {
  Simulator,
  SimulatorCreate,
  SimulatorIntegrationCreate,
  SimulatorIntegrationFilterQuery,
  SimulatorFilterQuery,
  SimulatorChange,
} from '../../types';
import { IntegrationsAPI } from './integrationsApi';

export class SimulatorsAPI extends BaseResourceAPI<Simulator> {
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

  public create = async (items: SimulatorCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = async (filter?: SimulatorFilterQuery) => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  public update = async (changes: SimulatorChange[]) => {
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
