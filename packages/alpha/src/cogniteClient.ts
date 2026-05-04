// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { LimitsAPI } from './api/limits/limitsApi';
import { MeteringAPI } from './api/metering/meteringApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;
  private limitsApi?: LimitsAPI;
  private meteringApi?: MeteringAPI;

  public get limits() {
    return accessApi(this.limitsApi);
  }

  public get metering() {
    return accessApi(this.meteringApi);
  }

  public get simulators() {
    return accessApi(this.simulatorsApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', '20230101-alpha');

    this.simulatorsApi = this.apiFactory(SimulatorsAPI, 'simulators');
    this.limitsApi = this.apiFactory(LimitsAPI, 'limits');
    this.meteringApi = this.apiFactory(MeteringAPI, 'metering');
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
