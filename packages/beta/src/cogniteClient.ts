// Copyright 2020 Cognite AS

import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { AlertsAPI } from './api/alerts/alertsApi';
import { SimulatorsAPI } from './api/simulators/simulatorsApi';
import { MonitoringTasksAPI } from './api/monitoringTasks/monitoringTasksApi';

class CogniteClientCleaned extends CogniteClientStable {
  // Remove type restrictions
}

export default class CogniteClient extends CogniteClientCleaned {
  private alertsApi?: AlertsAPI;
  private monitoringTasksApi?: MonitoringTasksAPI;
  private simulatorsApi?: SimulatorsAPI;

  /**
   * Create a new SDK client (beta)
   *
   * For smooth transition between stable sdk and beta, you may create an alias
   * `"@cognite/sdk": "@cognite/sdk-beta@^<version>"` in `package.json`
   * The beta SDK exports the client with the same name as stable, meaning you don't need to change any imports.
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   *
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options);
  }

  public get alerts() {
    return accessApi(this.alertsApi);
  }

  public get monitoringTasks() {
    return accessApi(this.monitoringTasksApi);
  }

  public get simulators() {
    return accessApi(this.simulatorsApi);
  }

  protected get version() {
    return `${version}-beta`;
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'beta');

    this.simulatorsApi = this.apiFactory(SimulatorsAPI, 'simulators');
    this.alertsApi = this.apiFactory(AlertsAPI, 'alerts');
    this.monitoringTasksApi = this.apiFactory(
      MonitoringTasksAPI,
      'monitoringtasks'
    );
  }
}
