// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { AlertingAPI } from './api/alerts/alertingApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private alertingApi?: AlertingAPI;

  /**
   * Create a new SDK client (alpha)
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  public get alerts() {
    return accessApi(this.alertingApi);
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'alpha');

    this.alertingApi = this.apiFactory(AlertingAPI, 'alerts');
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
