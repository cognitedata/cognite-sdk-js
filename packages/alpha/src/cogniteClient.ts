// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { LimitsAPI } from './api/limits/limitsApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;
  private limitsApi?: LimitsAPI;

  public get limits() {
    return accessApi(this.limitsApi);
  }

  public get simulators() {
    return accessApi(this.simulatorsApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'alpha');

    this.simulatorsApi = this.apiFactory(SimulatorsAPI, 'simulators');
    this.limitsApi = this.apiFactory(LimitsAPI, 'limits');
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
