// Copyright 2020 Cognite AS
import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;

  public get simulators() {
    return accessApi(this.simulatorsApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'alpha');

    this.simulatorsApi = this.apiFactory(SimulatorsAPI, 'simulators');
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
