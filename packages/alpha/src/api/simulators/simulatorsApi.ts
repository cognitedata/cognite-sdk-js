import type { IdEither, InternalId } from '@cognite/sdk';
import {
  BaseResourceAPI,
  type CDFHttpClient,
  type CogniteInternalId,
  type MetadataMap,
} from '@cognite/sdk-core';
import type {
  SimulationRunCreate,
  SimulationRunFilterQuery,
  SimulationRunId,
  Simulator,
  SimulatorChange,
  SimulatorCreate,
  SimulatorFilterQuery,
  SimulatorIntegrationCreate,
  SimulatorIntegrationFilterQuery,
  SimulatorModelChange,
  SimulatorModelCreate,
  SimulatorModelFilterQuery,
  SimulatorModelRevisionChange,
  SimulatorModelRevisionCreate,
  SimulatorModelRevisionFilterQuery,
  SimulatorRoutineCreate,
  SimulatorRoutineFilterQuery,
  SimulatorRoutineRevisionCreate,
  SimulatorRoutineRevisionslFilterQuery,
} from '../../types';
import { IntegrationsAPI } from './integrationsApi';
import { LogsAPI } from './logsApi';
import { ModelRevisionsAPI } from './modelRevisionsApi';
import { ModelsAPI } from './modelsApi';
import { RoutinesAPI } from './routinesApi';
import { RoutineRevisionsAPI } from './routinesRevisionsAPI';
import { SimulationRunDataAPI } from './simulationRunDataApi';
import { SimulationRunsAPI } from './simulationRunsApi';

export class SimulatorsAPI extends BaseResourceAPI<Simulator> {
  #integrationsApi: IntegrationsAPI;
  #runsApi: SimulationRunsAPI;
  #runDataApi: SimulationRunDataAPI;
  #modelsApi: ModelsAPI;
  #modelRevisionsApi: ModelRevisionsAPI;
  #routinesApi: RoutinesAPI;
  #routineRevisionsApi: RoutineRevisionsAPI;
  #logsApi: LogsAPI;

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

  constructor(...args: [string, CDFHttpClient, MetadataMap]) {
    super(...args);

    const [resourcePath, client, metadataMap] = args;

    this.#integrationsApi = new IntegrationsAPI(
      `${resourcePath}/integrations`,
      client,
      metadataMap
    );

    this.#runsApi = new SimulationRunsAPI(
      `${resourcePath}/runs`,
      client,
      metadataMap
    );

    this.#runDataApi = new SimulationRunDataAPI(
      `${resourcePath}/runs/data`,
      client,
      metadataMap
    );

    this.#modelsApi = new ModelsAPI(
      `${resourcePath}/models`,
      client,
      metadataMap
    );

    this.#modelRevisionsApi = new ModelRevisionsAPI(
      `${resourcePath}/models/revisions`,
      client,
      metadataMap
    );

    this.#routinesApi = new RoutinesAPI(
      `${resourcePath}/routines`,
      client,
      metadataMap
    );

    this.#routineRevisionsApi = new RoutineRevisionsAPI(
      `${resourcePath}/routines/revisions`,
      client,
      metadataMap
    );

    this.#logsApi = new LogsAPI(`${resourcePath}/logs`, client, metadataMap);
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
    return this.#integrationsApi.list(filter);
  };

  public createIntegrations = async (items: SimulatorIntegrationCreate[]) => {
    return this.#integrationsApi.create(items);
  };

  public deleteIntegrations = async (ids: IdEither[]) => {
    return this.#integrationsApi.delete(ids);
  };

  public listRuns = async (filter?: SimulationRunFilterQuery) => {
    return this.#runsApi.list(filter);
  };

  public listRunData = async (ids: SimulationRunId[]) => {
    return this.#runDataApi.retrieve(ids);
  };

  public runSimulation = async (items: SimulationRunCreate[]) => {
    return this.#runsApi.run(items);
  };

  public retrieveRuns = async (ids: CogniteInternalId[]) => {
    return this.#runsApi.retrieve(ids);
  };

  public listModels = async (filter?: SimulatorModelFilterQuery) => {
    return this.#modelsApi.list(filter);
  };

  public retrieveModels = async (items: IdEither[]) => {
    return this.#modelsApi.retrieve(items);
  };

  public createModels = async (items: SimulatorModelCreate[]) => {
    return this.#modelsApi.create(items);
  };

  public deleteModels = async (ids: IdEither[]) => {
    return this.#modelsApi.delete(ids);
  };

  public updateModels = async (changes: SimulatorModelChange[]) => {
    return this.#modelsApi.update(changes);
  };

  public listModelRevisions = async (
    filter?: SimulatorModelRevisionFilterQuery
  ) => {
    return this.#modelRevisionsApi.list(filter);
  };

  public retrieveModelRevisions = async (items: IdEither[]) => {
    return this.#modelRevisionsApi.retrieve(items);
  };

  public createModelRevisions = async (
    items: SimulatorModelRevisionCreate[]
  ) => {
    return this.#modelRevisionsApi.create(items);
  };

  public deleteModelRevisions = async (ids: IdEither[]) => {
    return this.#modelRevisionsApi.delete(ids);
  };

  public updateModelRevisions = async (
    changes: SimulatorModelRevisionChange[]
  ) => {
    return this.#modelRevisionsApi.update(changes);
  };

  public listRoutines = async (filter?: SimulatorRoutineFilterQuery) => {
    return this.#routinesApi.list(filter);
  };

  public createRoutines = async (items: SimulatorRoutineCreate[]) => {
    return this.#routinesApi.create(items);
  };

  public deleteRoutines = async (ids: IdEither[]) => {
    return this.#routinesApi.delete(ids);
  };

  public listRoutineRevisions = async (
    filter?: SimulatorRoutineRevisionslFilterQuery
  ) => {
    return this.#routineRevisionsApi.list(filter);
  };

  public retrieveRoutineRevisions = async (items: IdEither[]) => {
    return this.#routineRevisionsApi.retrieve(items);
  };

  public createRoutineRevisions = async (
    items: SimulatorRoutineRevisionCreate[]
  ) => {
    return this.#routineRevisionsApi.create(items);
  };

  public retrieveLogs = async (items: InternalId[]) => {
    return this.#logsApi.retrieve(items);
  };
}
