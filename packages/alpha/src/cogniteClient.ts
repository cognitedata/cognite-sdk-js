// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { version } from '../package.json';
import { accessApi } from '@cognite/sdk-core';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private simulatorsApi?: SimulatorsAPI;

  /**
   * Create a new SDK client (alpha)
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

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
