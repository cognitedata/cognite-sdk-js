// Copyright 2020 Cognite AS
import {
  ClientOptions,
  CogniteClient as CogniteClientStable,
} from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { AlertsAPI } from './api/alerts/alertsApi';
import { MonitoringTasksAPI } from './api/monitoringTasks/monitoringTasksApi';

export default class CogniteClientAlpha extends CogniteClientStable {
  private alertsApi?: AlertsAPI;
  private monitoringTasksApi?: MonitoringTasksAPI;

  /**
   * Create a new SDK client (alpha)
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

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'alpha');

    this.alertsApi = this.apiFactory(AlertsAPI, 'alerts');
    this.monitoringTasksApi = this.apiFactory(
      MonitoringTasksAPI,
      'monitoringtasks'
    );
  }

  protected get version() {
    return `${version}-alpha`;
  }
}
