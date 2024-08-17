// Copyright 2020 Cognite AS

import { CogniteClient as CogniteClientStable } from '@cognite/sdk';
import { accessApi } from '@cognite/sdk-core';
import { version } from '../package.json';
import { AlertsAPI } from './api/alerts/alertsApi';
import { DataPointsAPI } from './api/dataPoints/dataPointsApi';
import { FilesAPI } from './api/files/filesApi';
import { MonitoringTasksAPI } from './api/monitoringTasks/monitoringTasksApi';

class CogniteClientCleaned extends CogniteClientStable {
  // Remove type restrictions
}

export default class CogniteClient extends CogniteClientCleaned {
  private alertsApi?: AlertsAPI;
  protected filesApi?: FilesAPI;
  private monitoringTasksApi?: MonitoringTasksAPI;

  public get alerts() {
    return accessApi(this.alertsApi);
  }
  public get files() {
    return accessApi(this.filesApi);
  }

  public get monitoringTasks() {
    return accessApi(this.monitoringTasksApi);
  }

  public get datapoints() {
    return accessApi(this.dataPointsApi);
  }

  protected dataPointsApi?: DataPointsAPI;

  protected get version() {
    return `${version}-beta`;
  }

  protected initAPIs() {
    super.initAPIs();

    this.httpClient.setDefaultHeader('cdf-version', 'beta');

    this.alertsApi = this.apiFactory(AlertsAPI, 'alerts');
    this.filesApi = this.apiFactory(FilesAPI, 'files');
    this.monitoringTasksApi = this.apiFactory(
      MonitoringTasksAPI,
      'monitoringtasks',
    );
    this.dataPointsApi = this.apiFactory(DataPointsAPI, 'timeseries/data');
  }
}
