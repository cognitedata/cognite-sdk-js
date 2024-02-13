import {
  BaseResourceAPI,
  CDFHttpClient,
  CogniteInternalId,
  MetadataMap,
} from '@cognite/sdk-core';
import { IdEither } from '@cognite/sdk';
import {
  Simulator,
  SimulatorCreate,
  SimulatorIntegrationCreate,
  SimulatorIntegrationFilterQuery,
  SimulatorFilterQuery,
  SimulatorChange,
  SimulatorModelRevisionCreate,
  SimulatorRoutineCreate,
  SimulationRunCreate,
  SimulationRunFilterQuery,
  SimulatorModelFilterQuery,
  SimulatorRoutineFilterQuery,
  SimulatorModelCreate,
  SimulatorModelChange,
  SimulatorModelRevisionFilterQuery,
  SimulatorModelRevisionChange,
  SimulatorRoutineRevisionCreate,
} from '../../types';
import { IntegrationsAPI } from './integrationsApi';
import { SimulationRunsAPI } from './simulationRunsApi';
import { ModelsAPI } from './modelsApi';
import { ModelRevisionsAPI } from './modelRevisionsApi';
import { RoutinesAPI } from './routinesApi';
import { RoutineRevisionsAPI } from './routinesRevisionsAPI';

export class SimulatorsAPI extends BaseResourceAPI<Simulator> {
  private integrationsApi: IntegrationsAPI;
  private runsApi: SimulationRunsAPI;
  private modelsApi: ModelsAPI;
  private modelRevisionsApi: ModelRevisionsAPI;
  private routinesApi: RoutinesAPI;
  private routineRevisionsApi: RoutineRevisionsAPI;
  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [resourcePath, client, metadataMap] = args;

    this.integrationsApi = new IntegrationsAPI(
      `${resourcePath}/integrations`,
      client,
      metadataMap
    );

    this.runsApi = new SimulationRunsAPI(
      `${resourcePath}/runs`,
      client,
      metadataMap
    );

    this.modelsApi = new ModelsAPI(
      `${resourcePath}/models`,
      client,
      metadataMap
    );

    this.modelRevisionsApi = new ModelRevisionsAPI(
      `${resourcePath}/models/revisions`,
      client,
      metadataMap
    );

    this.routinesApi = new RoutinesAPI(
      `${resourcePath}/routines`,
      client,
      metadataMap
    );

    this.routineRevisionsApi = new RoutineRevisionsAPI(
      `${resourcePath}/routines/revisions`,
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

  public listRuns = async (filter?: SimulationRunFilterQuery) => {
    return this.runsApi.list(filter);
  };

  public runSimulation = async (items: SimulationRunCreate[]) => {
    return this.runsApi.run(items);
  };

  public retrieveRuns = async (ids: CogniteInternalId[]) => {
    return this.runsApi.retrieve(ids);
  };

  public listModels = async (filter?: SimulatorModelFilterQuery) => {
    return this.modelsApi.list(filter);
  };

  public createModel = async (items: SimulatorModelCreate[]) => {
    return this.modelsApi.create(items);
  };

  public deleteModel = async (ids: IdEither[]) => {
    return this.modelsApi.delete(ids);
  };

  public updateModel = async (changes: SimulatorModelChange[]) => {
    return this.modelsApi.update(changes);
  };

  public listModelRevisions = async (
    filter?: SimulatorModelRevisionFilterQuery
  ) => {
    return this.modelRevisionsApi.list(filter);
  };

  public createModelRevisions = async (
    items: SimulatorModelRevisionCreate[]
  ) => {
    return this.modelRevisionsApi.create(items);
  };

  public deleteModelRevisions = async (ids: IdEither[]) => {
    return this.modelRevisionsApi.delete(ids);
  };

  public updateModelRevisions = async (
    changes: SimulatorModelRevisionChange[]
  ) => {
    return this.modelRevisionsApi.update(changes);
  };

  public listRoutines = async (filter?: SimulatorRoutineFilterQuery) => {
    return this.routinesApi.list(filter);
  };

  public createRoutines = async (items: SimulatorRoutineCreate[]) => {
    return this.routinesApi.create(items);
  };

  public deleteRoutines = async (ids: IdEither[]) => {
    return this.routinesApi.delete(ids);
  };

  public createRoutineRevisions = async (
    items: SimulatorRoutineRevisionCreate[]
  ) => {
    return this.routineRevisionsApi.create(items);
  };
}
