// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { DataProductVersionsAPI } from './api/dataProducts/dataProductVersionsApi';
import { DataProductsAPI } from './api/dataProducts/dataProductsApi';
import { InstancesAlphaAPI } from './api/instances/instancesApi';
import { LimitsAPI } from './api/limits/limitsApi';
import { MeteringAPI } from './api/metering/meteringApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';
import { WorkflowExecutionsAPI } from './api/workflows/workflowExecutionsApi';
import { WorkflowTriggersAPI } from './api/workflows/workflowTriggersApi';
import { WorkflowVersionsAPI } from './api/workflows/workflowVersionsApi';
import { WorkflowsAPI } from './api/workflows/workflowsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;
  private limitsApi?: LimitsAPI;
  private meteringApi?: MeteringAPI;
  private workflowsApi?: WorkflowsAPI;
  private workflowVersionsApi?: WorkflowVersionsAPI;
  private workflowExecutionsApi?: WorkflowExecutionsAPI;
  private workflowTriggersApi?: WorkflowTriggersAPI;
  private dataProductsApi?: DataProductsAPI;
  private dataProductVersionsApi?: DataProductVersionsAPI;
  private instancesAlphaApi?: InstancesAlphaAPI;

  public get limits() {
    return accessApi(this.limitsApi);
  }

  public get metering() {
    return accessApi(this.meteringApi);
  }

  public get instances() {
    return accessApi(this.instancesAlphaApi);
  }

  public get simulators() {
    return accessApi(this.simulatorsApi);
  }

  public get workflows() {
    return accessApi(this.workflowsApi);
  }

  public get workflowVersions() {
    return accessApi(this.workflowVersionsApi);
  }

  public get workflowExecutions() {
    return accessApi(this.workflowExecutionsApi);
  }

  public get workflowTriggers() {
    return accessApi(this.workflowTriggersApi);
  }

  public get dataProducts() {
    return accessApi(this.dataProductsApi);
  }

  public get dataProductVersions() {
    return accessApi(this.dataProductVersionsApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', '20230101-alpha');

    this.simulatorsApi = this.apiFactory(SimulatorsAPI, 'simulators');
    this.limitsApi = this.apiFactory(LimitsAPI, 'limits');
    this.meteringApi = this.apiFactory(MeteringAPI, 'metering');
    this.workflowsApi = this.apiFactory(WorkflowsAPI, 'workflows');
    this.workflowVersionsApi = this.apiFactory(
      WorkflowVersionsAPI,
      'workflows/versions'
    );
    this.workflowTriggersApi = this.apiFactory(
      WorkflowTriggersAPI,
      'workflows/triggers'
    );
    this.dataProductsApi = this.apiFactory(DataProductsAPI, 'dataproducts');
    this.dataProductVersionsApi = this.apiFactory(
      DataProductVersionsAPI,
      'dataproducts'
    );
    this.instancesAlphaApi = this.apiFactory(
      InstancesAlphaAPI,
      'models/instances'
    );
    this.workflowExecutionsApi = new WorkflowExecutionsAPI(
      `${this.projectUrl}/workflows/executions`,
      `${this.projectUrl}/workflows`,
      this.httpClient,
      this.metadataMap
    );
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
