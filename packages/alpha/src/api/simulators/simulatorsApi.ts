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
  SimulatorModelAggregateQuery,
  SimulatorModelChange,
  SimulatorModelCreate,
  SimulatorModelFilterQuery,
  SimulatorModelRevisionChange,
  SimulatorModelRevisionCreate,
  SimulatorModelRevisionFilterQuery,
  SimulatorRoutineAggregateQuery,
  SimulatorRoutineCreate,
  SimulatorRoutineFilterQuery,
  SimulatorRoutineRevisionBase,
  SimulatorRoutineRevisionCreate,
  SimulatorRoutineRevisionView,
  SimulatorRoutineRevisionsFilterQuery,
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
  private integrationsApi: IntegrationsAPI;
  private runsApi: SimulationRunsAPI;
  private runDataApi: SimulationRunDataAPI;
  private modelsApi: ModelsAPI;
  private modelRevisionsApi: ModelRevisionsAPI;
  private routinesApi: RoutinesAPI;
  private routineRevisionsApi: RoutineRevisionsAPI;
  private logsApi: LogsAPI;

  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(['items'], ['createdTime', 'lastUpdatedTime']);
  }

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

    this.runDataApi = new SimulationRunDataAPI(
      `${resourcePath}/runs/data`,
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

    this.logsApi = new LogsAPI(`${resourcePath}/logs`, client, metadataMap);
  }

  public create = (items: SimulatorCreate[]) => {
    return this.createEndpoint(items);
  };

  public list = (filter?: SimulatorFilterQuery) => {
    return this.listEndpoint(this.callListEndpointWithPost, filter);
  };

  public update = (changes: SimulatorChange[]) => {
    return this.updateEndpoint(changes);
  };

  public delete = (ids: IdEither[]) => {
    return this.deleteEndpoint(ids);
  };

  public listIntegrations = (filter?: SimulatorIntegrationFilterQuery) => {
    return this.integrationsApi.list(filter);
  };

  public createIntegrations = (items: SimulatorIntegrationCreate[]) => {
    return this.integrationsApi.create(items);
  };

  public deleteIntegrations = (ids: IdEither[]) => {
    return this.integrationsApi.delete(ids);
  };

  public listRuns = (filter?: SimulationRunFilterQuery) => {
    return this.runsApi.list(filter);
  };

  public listRunData = (ids: SimulationRunId[]) => {
    return this.runDataApi.retrieve(ids);
  };

  /**
   * [Run a simulation](Run a simulation <https://developer.cognite.com/api#tag/Simulation-Runs/operation/run_simulation_simulators_run_post)
   *
   * ```js
   * const simulationRun = await client.simulators.runSimulation([{ "routineExternalId": "DWSIM-ShowerMixer" }]);
   * ```
   */
  public runSimulation = (items: SimulationRunCreate[]) => {
    return this.runsApi.run(items);
  };

  public retrieveRuns = (ids: CogniteInternalId[]) => {
    return this.runsApi.retrieve(ids);
  };

  public aggregateModels = (query: SimulatorModelAggregateQuery) => {
    return this.modelsApi.aggregate(query);
  };

  public listModels = (filter?: SimulatorModelFilterQuery) => {
    return this.modelsApi.list(filter);
  };

  public retrieveModels = (items: IdEither[]) => {
    return this.modelsApi.retrieve(items);
  };

  public createModels = (items: SimulatorModelCreate[]) => {
    return this.modelsApi.create(items);
  };

  public deleteModels = (ids: IdEither[]) => {
    return this.modelsApi.delete(ids);
  };

  public updateModels = (changes: SimulatorModelChange[]) => {
    return this.modelsApi.update(changes);
  };

  public listModelRevisions = (filter?: SimulatorModelRevisionFilterQuery) => {
    return this.modelRevisionsApi.list(filter);
  };

  public retrieveModelRevisions = (items: IdEither[]) => {
    return this.modelRevisionsApi.retrieve(items);
  };

  public createModelRevisions = (items: SimulatorModelRevisionCreate[]) => {
    return this.modelRevisionsApi.create(items);
  };

  public deleteModelRevisions = (ids: IdEither[]) => {
    return this.modelRevisionsApi.delete(ids);
  };

  public updateModelRevisions = (changes: SimulatorModelRevisionChange[]) => {
    return this.modelRevisionsApi.update(changes);
  };

  public listRoutines = (filter?: SimulatorRoutineFilterQuery) => {
    return this.routinesApi.list(filter);
  };

  public createRoutines = (items: SimulatorRoutineCreate[]) => {
    return this.routinesApi.create(items);
  };

  public aggregateRoutines = (query: SimulatorRoutineAggregateQuery) => {
    return this.routinesApi.aggregate(query);
  };

  public deleteRoutines = (ids: IdEither[]) => {
    return this.routinesApi.delete(ids);
  };

  public listRoutineRevisions = <
    RevisionResponseType extends
      SimulatorRoutineRevisionBase = SimulatorRoutineRevisionView,
  >(
    filter?: SimulatorRoutineRevisionsFilterQuery
  ) => {
    return this.routineRevisionsApi.list<RevisionResponseType>(filter);
  };

  public retrieveRoutineRevisions = (items: IdEither[]) => {
    return this.routineRevisionsApi.retrieve(items);
  };

  public createRoutineRevisions = (items: SimulatorRoutineRevisionCreate[]) => {
    return this.routineRevisionsApi.create(items);
  };

  public retrieveLogs = (items: InternalId[]) => {
    return this.logsApi.retrieve(items);
  };
}
