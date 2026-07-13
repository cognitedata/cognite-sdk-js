// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { DataProductsAPI } from './api/dataProducts/dataProductsApi';
import { LimitsAPI } from './api/limits/limitsApi';
import { MeteringAPI } from './api/metering/meteringApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';
import { WorkflowExecutionsAPI } from './api/workflows/workflowExecutionsApi';
import { WorkflowVersionsAPI } from './api/workflows/workflowVersionsApi';
import { WorkflowsAPI } from './api/workflows/workflowsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;
  private limitsApi?: LimitsAPI;
  private meteringApi?: MeteringAPI;
  private workflowsApi?: WorkflowsAPI;
  private workflowVersionsApi?: WorkflowVersionsAPI;
  private workflowExecutionsApi?: WorkflowExecutionsAPI;
  private dataProductsApi?: DataProductsAPI;

  public get limits() {
    return accessApi(this.limitsApi);
  }

  public get metering() {
    return accessApi(this.meteringApi);
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

  public get dataProducts() {
    return accessApi(this.dataProductsApi);
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
    this.dataProductsApi = this.apiFactory(DataProductsAPI, 'dataproducts');
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
