// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { LimitsAPI } from './api/limits/limitsApi';
import { MeteringAPI } from './api/metering/meteringApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';
import { WorkflowVersionsAPI } from './api/workflows/workflowVersionsApi';
import { WorkflowsAPI } from './api/workflows/workflowsApi';
import { DataProductsAPI } from './api/dataProducts/dataProductsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;
  private limitsApi?: LimitsAPI;
  private meteringApi?: MeteringAPI;
  private workflowsApi?: WorkflowsAPI;
  private workflowVersionsApi?: WorkflowVersionsAPI;
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
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
