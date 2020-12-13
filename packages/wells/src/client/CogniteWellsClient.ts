import { BaseCogniteClient, ClientOptions } from '@cognite/sdk-core';
import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { version } from '../../package.json';
import { WELL_SERVICE_BASE_URL } from './api/utils';
import { WellboresAPI } from './api/wellboresAPI';
import { Cluster } from './model/Cluster';

export default class CogniteWellsClient extends BaseCogniteClient {
  public get wells() {
    return accessApi(this.wellsApi);
  }

  public get wellbores() {
    return accessApi(this.wellboresApi);
  }

  private wellsApi?: WellsAPI;
  private wellboresApi?: WellboresAPI;
  private cluster: Cluster;

  constructor(options: ClientOptions, cluster: Cluster) {
    super(options);
    this.cluster = cluster;
  }

  protected initAPIs() {
    // wells
    this.setBaseUrl(WELL_SERVICE_BASE_URL);
    this.wellsApi = this.apiFactory(WellsAPI, 'wells');
    this.wellsApi.setHttpClient = this.httpClient;
    this.wellsApi.setProject = this.project;
    this.wellsApi.setCluster = this.cluster;

    // wellbores
    this.setBaseUrl(WELL_SERVICE_BASE_URL);
    this.wellboresApi = this.apiFactory(WellboresAPI, 'wellbores');
    this.wellboresApi.setHttpClient = this.httpClient;
    this.wellboresApi.setProject = this.project;
    this.wellboresApi.setCluster = this.cluster;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
